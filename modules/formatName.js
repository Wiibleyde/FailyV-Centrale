module.exports = {
    name: (nameToFormat) => {
        if(nameToFormat != null) {
            let name = nameToFormat.charAt(0).toUpperCase() + nameToFormat.slice(1);
            if(nameToFormat.length > 2) {
                if(name.includes('-')) {
                    for(j=0;j<name.length;j++) {
                        if(name.charAt(j).includes('-')) {
                            name = name.substring(0, j+1) + nameToFormat.charAt(j+1).toUpperCase() + nameToFormat.slice(j+2);
                        }
                    }
                }
                for(j=2;j<nameToFormat.length;j++) {
                    name = name + ' ' + nameToFormat[j].charAt(0).toUpperCase() + nameToFormat[j].slice(1);
                }
            } else {
                if(name.includes('-')) {
                    for(j=0;j<name.length;j++) {
                        if(name.charAt(j).includes('-')) {
                            name = name.substring(0, j+1) + nameToFormat.charAt(j+1).toUpperCase() + nameToFormat.slice(j+2);
                        }
                    }
                }
            }
            return name;
        }
    }
}