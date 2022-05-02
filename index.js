import express from "express";
import { EventEmitter } from 'events';
import HueBridgeService from './hue-bridge-service.js';
import RpiNoiseService from './rpi-noise-service.js';
import Worker from './worker.js';
import { fromEvent, combineLatest, map, tap, timer, distinctUntilChanged  } from 'rxjs';
import FloorLampLivingRoom from "./FloorLampLivingRoom.js";
import TiffanyLampLivingRoom from "./TiffanyLampLivingRoom.js";
import * as dotenv from "dotenv";

dotenv.config();

const servicePort = process.env.SERVICE_PORT;
const eventEmitter = new EventEmitter();

const sourceLightLevelLivingRoom = fromEvent(eventEmitter, 'livingroom.lightlevel');
const sourceMotionLivingRoom = fromEvent(eventEmitter, 'livingroom.motion');
const sourceNoiseLivingRoom = fromEvent(eventEmitter, 'livingroom.noise');

const humanPresenceLivingRoom = combineLatest(sourceMotionLivingRoom, sourceNoiseLivingRoom);

const turnOffLampsTimer = timer(1000 * 60 * 10); //10 minutes
let turnOffLampsTimerSubscription = undefined;


const app = express();
app.set('eventEmitter', eventEmitter);
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl} ${JSON.stringify(req.body)}`);
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.json({message: err.message});
});
app.listen(servicePort);
console.log(`Listening on port ${servicePort}`);

const bridgeService = new HueBridgeService();
const rpiNoiseService = new RpiNoiseService();

const floorLampLivingRoom = new FloorLampLivingRoom();
const tiffanyLampLivingRoom = new TiffanyLampLivingRoom();


/* SUBSCRIBE TO EVENTEMITTER EVENTS using rxjs */

const humanPresenceLivingRoomSubscription = humanPresenceLivingRoom.pipe(
    //consume raw data of motion and noise and map noise to something more useful
    map( ([motion, noise]) => {
        const noiseDetected = noise.includes(0); //noise occured when there is a zero in the data array
        return [motion, noiseDetected];
    },
    (err) => console.log('Error: ' + err),
    () => console.log('Completed')),

    //only emit a value if human is present based on noise or motion
    map( ([motion, noiseDetected]) => {
        //console.log(`motion: ${motion} and noiseDetected: ${noiseDetected}`);
        return motion || noiseDetected;
    },
    (err) => console.log('Error: ' + err),
    () => console.log('Completed')),

    // only emit when the value changes
    distinctUntilChanged(),

    tap( humanPresent => {
        console.log(`human present: ${humanPresent}`);

        if( !humanPresent ) {
            //create a timer of 10 minutes and TURN off light
            console.log('starting timer to turn off lamps');
            turnOffLampsTimerSubscription = turnOffLampsTimer.subscribe(val => eventEmitter.emit('livingroom.lamps.off', {}));
        } else {
            //stop the timer
            console.log('stopping timer to turn off lamps');
            if(turnOffLampsTimerSubscription)
                turnOffLampsTimerSubscription.unsubscribe();
        }

    },
    (err) => console.log('Error: ' + err),
    () => console.log('Completed')),
).subscribe();


/* RUN BACKGROUND TASKS */

const worker = new Worker(eventEmitter, bridgeService, rpiNoiseService);
worker.startPollings();


/* PROVIDE REST ENDPOINTS */

app.get("/devices", async (req, res) => {    
    const devicesData = await bridgeService.devices();
    console.log( devicesData );
    res.json(devicesData);
});

app.get("/devices/battery", async (req, res) => {    
    const batteryData = await bridgeService.batteryMotionSensorLivingRoom();
    console.log( `Battery Motionsensor LivingRoom: ${batteryData}` );
    res.json(batteryData);
});

app.post("/worker/pollings/start", async (req, res) => {
    worker.startPollings();    // maybe in constructor to run them automatically later
    res.send('started');
    res.status(201).end();
});

app.post("/worker/pollings/stop", async (req, res) => {    
    worker.stopPollings();
    res.send('stopped');
    res.status(201).end();
});


/* REGISTER EVENTEMITTER LISTENERS */

eventEmitter.on('livingroom.lamps.off', (data) => {
    console.log('turning off floor lamp living room');
    bridgeService.updateDeviceLivingRoom(floorLampLivingRoom.lightServicePath, floorLampLivingRoom.lightServiceId, floorLampLivingRoom.off);
    
    console.log('turning off tiffany lamp living room');
    bridgeService.updateDeviceLivingRoom(tiffanyLampLivingRoom.lightServicePath, tiffanyLampLivingRoom.lightServiceId, tiffanyLampLivingRoom.off); 
});