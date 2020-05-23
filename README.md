VSCode extension to debug Node-based [azure-pipelines-tasks](https://github.com/microsoft/azure-pipelines-tasks) directly from VS Code:

# Install
Extension is not available in VS Code market so must be run locally via VS Code

* Clone the repo
* `npm install`
* Open in VS Code and hit F5
* In new VS Code window select azure-pipelines-tasks project

# Debug Azure Pipelines Task locally 
* Navigate to `task.json` for a task you want to profile (navigation panel)
* `Azure Pipelines: Generate Debug Profile` from context menu (right click on `task.json`) to generate Debug configuration
* Set required param in generated configuration (`Debug [Task Name]` and run it.
```
        {
            "name": "Debug CopyFilesOverSSHV0",
            "type": "node",
            "request": "launch",
            "args": [
                "${workspaceRoot}/Tasks/CopyFilesOverSSHV0/copyfilesoverssh.ts"
            ],
            "runtimeArgs": [
                "--nolazy",
                "-r",
                "ts-node/register"
            ],
            "sourceMaps": true,
            "cwd": "${workspaceRoot}",
            "protocol": "inspector",
            "env": {
                "INPUT_SSHENDPOINT": "SSH",
                "ENDPOINT_AUTH_PARAMETER_SSH_USERNAME": "",
                "ENDPOINT_AUTH_PARAMETER_SSH_PASSWORD": "",
                "ENDPOINT_DATA_SSH_HOST": "",
                "INPUT_SOURCEFOLDER": "",
                "INPUT_CONTENTS": "**",
                "INPUT_TARGETFOLDER": "",
                "INPUT_CLEANTARGETFOLDER": "false",
                "INPUT_READYTIMEOUT": "20000",
                "INPUT_OVERWRITE": "true",
                "INPUT_FAILONEMPTYSOURCE": "false",
                "INPUT_FLATTENFOLDERS": "false"
            }
        }
    ]
```
