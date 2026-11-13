process.env.DEMO_USER_ID = 'test-demo-user-id';
process.env.USER_JWT_SECRET = 'test-user-jwt-secret';
process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret';
process.env.SALT = '10';
process.env.USER_PREFIX = 'test_';

// Mosquitto
process.env.MQTT_URL = 'mqtt://localhost:1883';
process.env.MQTT_BASE_TOPIC = 'alarmas';
process.env.MQTT_USERNAME = 'test-username';
process.env.MQTT_PASS = 'test-pass';
process.env.MQTT_CA_PATH = './src/mqtt/certs/emqxsl-ca.crt';
