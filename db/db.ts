import Controller from './controller';
import path from 'path';
import klaw from "klaw"
import mongoose from 'mongoose';
import Logger from '../utils/Logger';

export default class DBLoader {
  logger: Logger;
  constructor() {
    this.logger = new Logger()
  }
  async loadModels(): Promise<any> {
    let newModels: any = {};
    return new Promise((resolve, reject) => {
      klaw(__dirname + "/models").on("data", async (data) => {
        if (data.stats.isDirectory()) return
        const newModel = await import(data.path)
        const file = path.parse(data.path)
        newModels[file.name.toLowerCase()] = new Controller(newModel.default);
        this.logger.debug(`Loaded Mongo Model: ${file.name}`)
      }).once("end", () => resolve(newModels))
    })
  }
}
