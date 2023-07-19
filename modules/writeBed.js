//Appel de Jimp pour l'édition d'image
const Jimp = require('jimp');
//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');

module.exports = {
    write: async (patient, letter, surveillance, client) => {
        return new Promise(async (resolve, reject) => {
            //Définition de la position du texte en fonction de la lettre du lit
            let x1; let y1;
            //Récupération de l'image de base
            const image = await Jimp.read('./src/img/lit_template.png');
            //Récupération du point rouge de surveillance
            const redDot = await Jimp.read(`./src/img/red_dot.png`);
            //Récupération de la police d'écriture
            const font = await Jimp.loadFont('src/fonts/Ubuntu.fnt');
            for(i=0;i<patient.length;i++) {
                if(letter[i] == 'a') { x1 = 1021; y1 = 559; }
                if(letter[i] == 'b') { x1 = 1021; y1 = 376; }
                if(letter[i] == 'c') { x1 = 1021; y1 = 193; }
                if(letter[i] == 'd') { x1 = 1021; y1 = 10; }
                if(letter[i] == 'e') { x1 = 731; y1 = 10; }
                if(letter[i] == 'f') { x1 = 731; y1 = 193; }
                if(letter[i] == 'g') { x1 = 731; y1 = 376; }
                if(letter[i] == 'h') { x1 = 731; y1 = 559; }
                if(letter[i] == 'i') { x1 = 388; y1 = 560; }
                if(letter[i] == 'j') { x1 = 388; y1 = 377; }
                if(letter[i] == 'k') { x1 = 388; y1 = 194; }
                if(letter[i] == 'l') { x1 = 388; y1 = 11; }
                if(letter[i] == 'm') { x1 = 99; y1 = 11; }
                if(letter[i] == 'n') { x1 = 99; y1 = 194; }
                if(letter[i] == 'o') { x1 = 99; y1 = 377; }
                if(letter[i] == 'p') { x1 = 99; y1 = 560; }
                if(letter[i] == 'q') { x1 = 1299; y1 = 353; }
                if(letter[i] == 'r') { x1 = 1651; y1 = 353; }
                let x2 = x1; let y2 = y1 + 51;

                //Séparation du prénom et nom pour retour à la ligne
                patientName = patient[i].split(' ');
                let firstname = patientName[0].charAt(0).toUpperCase() + patientName[0].slice(1);
                if(firstname.includes('-')) {
                    for(j=0;j<firstname.length;j++) {
                        if(firstname.charAt(j).includes('-')) {
                            firstname = firstname.substring(0, j+1) + patientName[0].charAt(j+1).toUpperCase() + patientName[0].slice(j+2);
                        }
                    }
                }
                if(patientName[0] == 'ua' || patientName[0] == 'ur' || patientName[0] == 'dcd') {
                    firstname = patientName[0].toUpperCase();
                }
                let lastname = null;
                if(patientName[1] != null) {
                    lastname = patientName[1].charAt(0).toUpperCase() + patientName[1].slice(1);
                    if(patientName.length > 2) {
                        if(lastname.includes('-')) {
                            for(j=0;j<lastname.length;j++) {
                                if(lastname.charAt(j).includes('-')) {
                                    lastname = lastname.substring(0, j+1) + patientName[1].charAt(j+1).toUpperCase() + patientName[1].slice(j+2);
                                }
                            }
                        }
                        for(j=2;j<patientName.length;j++) {
                            lastname = lastname + ' ' + patientName[j].charAt(0).toUpperCase() + patientName[j].slice(1);
                        }
                    } else {
                        if(lastname.includes('-')) {
                            for(j=0;j<lastname.length;j++) {
                                if(lastname.charAt(j).includes('-')) {
                                    lastname = lastname.substring(0, j+1) + patientName[1].charAt(j+1).toUpperCase() + patientName[1].slice(j+2);
                                }
                            }
                        }
                    }
                }

                if(letter[i] == 'q' || letter[i] == 'r') {
                    const fontCanvas = new Jimp(750, 130);
                    if(surveillance[i] == '1') {
                        fontCanvas.blit(redDot, 0, 0);
                    }
                    fontCanvas.print(font, 8, 5,
                        {
                            text: firstname,
                            alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                            alignmentY: Jimp.VERTICAL_ALIGN_TOP
                        }
                    );
                    if(lastname != null) {
                        fontCanvas.print(font, 8, 56,
                            {
                                text: lastname,
                                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                                alignmentY: Jimp.VERTICAL_ALIGN_TOP
                            }
                        );
                    }
                    fontCanvas.rotate(90);
                    //await fontCanvas.write(`src/img/generated/${currentLetter}.png`);
                    image.composite(fontCanvas, x1-8, -y1+5);
                } else {
                    if(surveillance[i] == '1') {
                        image.blit(redDot, x1-8, y1-5);
                    }
                    //Écriture du nouveau texte
                    image.print(font, x1, y1,
                        {
                            text: firstname,
                            alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                            alignmentY: Jimp.VERTICAL_ALIGN_TOP
                        }
                    );
                    if(lastname != null) {
                        image.print(font, x2, y2,
                            {
                                text: lastname,
                                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                                alignmentY: Jimp.VERTICAL_ALIGN_TOP
                            }
                        );
                    }
                }

            }
            image.write('src/img/generated/lit.' + image.getExtension());
            resolve(await client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(process.env.IRIS_BEDS_CHANNEL_ID).send({ files: [{ attachment: './src/img/generated/lit.png' }]}));
        });

    }
}