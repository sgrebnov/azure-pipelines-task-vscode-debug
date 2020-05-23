import * as path from 'path';
import * as fs from 'fs';

import {TaskDefinition} from 'vso-node-api/interfaces/TaskAgentInterfaces';

export default class AzPipelinesTask {
    taskDefinition: TaskDefinition;
    taskName: string;

    constructor(taskDefinitionPath: string) {

        if (!fs.existsSync(taskDefinitionPath)) {
            throw new Error(`Task definition does not exist: ${taskDefinitionPath}`);
        }

        this.taskDefinition = require(taskDefinitionPath);
        // we use folder name to distinct V0 vs V1, etc
		this.taskName = path.basename(path.dirname(taskDefinitionPath));
    }

}