import axios from "axios";
import https from "https";
import * as dotenv from "dotenv";

dotenv.config();

const hueBridgeHost = process.env.HUE_BRIDGE_HOST;
const host = `https://${hueBridgeHost}`;
const apiKey = process.env.HUE_BRIDGE_API_KEY;
const hueBase = `${host}/clip/v2/resource`;

const client = axios.create({
    headers: {
        'hue-application-key': apiKey
    },
    httpsAgent: new https.Agent({rejectUnauthorized: false})
});

client.interceptors.request.use( config => {
    config.headers['hue-application-key'] = apiKey;
    return config;
}, error => {
    return Promise.reject(error);
});

/*client.interceptors.response.use( response => {
    //log every response
});*/

class HueBridgeService {

    async devices() {
        try {
            const response = await client.get(`${hueBase}/device`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    async rooms() {
        try {
            const response = await client.get(`${hueBase}/room`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    /* returns boolean */
    async motionMotionSensorLivingRoom() {
        try {
            const response = await client.get(`${hueBase}/motion/b106d08a-68ae-47e7-932e-7424c5862f09`);
            return response.data.data[0].motion.motion;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    /* returns number */
    async lightLevelMotionSensorLivingRoom() {
        try {
            const response = await client.get(`${hueBase}/light_level/30f5ff23-4b37-4405-b6e6-009629ca52da`);
            return response.data.data[0].light.light_level;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    /* returns number */
    async temperatureMotionSensorLivingRoom() {
        try {
            const response = await client.get(`${hueBase}/temperature/eb89c968-62f9-4196-9bd4-4e51d8732952`);
            return response.data.data[0].temperature.temperature;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    /* returns number */
    async batteryMotionSensorLivingRoom() {
        try {
            const response = await client.get(`${hueBase}/device_power/b299c7ea-3a38-49bf-a193-3e788f284442`);
            return response.data.data[0].power_state.battery_level;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateDeviceLivingRoom(servicePath, serviceDeviceId, body) {
        try {
            await client.put(`${hueBase}/${servicePath}/${serviceDeviceId}`, body);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default HueBridgeService;