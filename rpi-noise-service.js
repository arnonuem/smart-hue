import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const client = axios.create();

const rpiNoiseHost = process.env.RPI_NOISE_HOST;
const host = `http://${rpiNoiseHost}`;
const port = process.env.RPI_NOISE_PORT;
const url = `${host}:${port}/noise`

class RpiNoiseService {

    async noiseSensorLivingRoom() {
        try {
            const response = await client.get(url);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default RpiNoiseService;