export default class TiffanyLampLivingRoom {
    lightServiceId = '82922d0c-406e-491b-bcf5-a8f0462aea6d'
    lightServicePath = '/light'
    on = {
        "on": {
            "on": true
        }
    }
    off = {
        "on": {
            "on": false
        }
    }
    defaults = {
        "dimming": {
            "brightness": 20.0,
            "min_dim_level": 5.0
        },
        "dimming_delta": {},
        "dynamics": {
            "speed": 0.0,
            "speed_valid": false,
            "status": "none",
            "status_values": [
                "none"
            ]
        },
        "effects": {
            "effect_values": [
                "no_effect",
                "candle"
            ],
            "status": "no_effect",
            "status_values": [
                "no_effect",
                "candle"
            ]
        },        "mode": "normal",
        "on": {
            "on": true
        }
    }
    tvDefaults = {
        "on": {
            "on": false
        }
    }

}