import yaml
import os

class ConfigService:
    def __init__(self,filename):
        self.filename = filename
        if not os.path.exists(self.filename):
            self.createConfigFile()
        self.config = self.loadConfigFile()

    def createConfigFile(self):
        with open(self.filename,'w') as f:
            yaml.dump({
                "Bot_token":"Your bot token",
                "Main_channel":"Your main channel ID",
                "Service_role":"Your service role ID",
                "Dispatcher_role":"Your dispatcher role ID",
                "Journey_role":"Your journey role ID",
                "Psy_channel":"Your psy channel ID",
                "Chir_channel":"Your chir channel ID",
                "PPA_channel":"Your ppa channel ID",
                "Bodies_channel":"Your bodies channel ID",
                "New_doc_category":"Your new doc category ID",
            },f)

    def loadConfigFile(self):
        with open(self.filename,'r') as f:
            return yaml.load(f,Loader=yaml.FullLoader)
        
    def get(self,key):
        return self.config[key]
    
    def set(self,key,value):
        self.config[key] = value
        return self.saveConfigFile()
    
    def saveConfigFile(self):
        with open(self.filename,"w") as f:
            f.write(yaml.dump(self.config))
        return True