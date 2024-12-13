import { MongoDB } from './database/mongo-db';
import { App } from './server/server';

MongoDB.connect();

App.create();
