import { Observable, fromEvent, combineLatest, map, tap, timeInterval } from 'rxjs';

class Worker {

    constructor(eventEmitter, bridgeService, rpiNoiseService) {
        this.eventEmitter = eventEmitter;
        this.bridgeService = bridgeService;
        this.rpiNoiseService = rpiNoiseService;
        this.pollingsActive = true;
    }

    fetchLightLevel = async () => {
        try {
            const lightLevel = await this.bridgeService.lightLevelMotionSensorLivingRoom();
            this.eventEmitter.emit('livingroom.lightlevel', lightLevel);
        } catch (error) {
            console.log(error);
        }
    }

    fetchMotion = async () => {
        try {
            const motion = await this.bridgeService.motionMotionSensorLivingRoom();
            this.eventEmitter.emit('livingroom.motion', motion);
        } catch (error) {
            console.log(error);
        }
    }

    fetchSound = async () => {
        try {
            const noise = await this.rpiNoiseService.noiseSensorLivingRoom();
            this.eventEmitter.emit('livingroom.noise', noise);
        } catch (error) {
            console.log(error);
        }
    }


//TODO refactor with RXJS

    /* start polling light level of motion sensor in living room */
    startPollings() {
        this.pollingsActive = true;

        this.poll(this.fetchLightLevel, () => this.pollingsActive, 2000);
        this.poll(this.fetchMotion, () => this.pollingsActive, 2000);
        this.poll(this.fetchSound, () => this.pollingsActive, 2000);
    }

    stopPollings() {
        this.pollingsActive = false;
    }

    async poll(fn, fnCondition, ms) {
        let result = await fn();
        while (fnCondition(result)) {
            await this.wait(ms);
            result = await fn();
        }
        return result;
    };

    wait(ms = 800) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    };
}

export default Worker;