const { EmbedBuilder } = require('discord.js');
//Récup du logger
const logger = require('./logger');

//Création de l'embed en fonction des arguments fournis
module.exports = {
    generate: function(title, url, desc, color, thumb, img, author, authorImg, authorLink, footer, footerImg, timestamp) {

        var err = null;

        const emb = new EmbedBuilder();

        if(title != null) { emb.setTitle(title); }
        if(url != null) { emb.setURL(url); }
        if(desc != null) { emb.setDescription(desc); }
        if(color != null) { emb.setColor(color); }
        if(thumb != null) { emb.setThumbnail(thumb); }
        if(img != null) { emb.setImage(img); }
        if(author != null && authorImg == null && authorLink == null) { emb.setAuthor({ name: author }); }
        if(author != null && authorImg != null && authorLink == null) { emb.setAuthor({ name: author, iconURL: authorImg }); }
        if(author != null && authorImg == null && authorLink != null) { emb.setAuthor({ name: author, url: authorLink }); }
        if(author != null && authorImg != null && authorLink != null) { emb.setAuthor({ name: author, iconURL: authorImg, url: authorLink }); }
        if(author == null && authorImg != null && authorLink == null) { err = 'Il faut obligatoirement un nom d\'auteur pour mettre une image !'; logger.error(err); }
        if(author == null && authorImg == null && authorLink != null) { err = 'Il faut obligatoirement un nom d\'auteur pour mettre un lien !'; logger.error(err); }
        if(author == null && authorImg != null && authorLink != null) { err = 'Il faut obligatoirement un nom d\'auteur pour mettre une image et un lien !'; logger.error(err); }
        if(footer != null && footerImg == null) { emb.setFooter({ text: footer }); }
        if(footer != null && footerImg != null) { emb.setFooter({ text: footer, iconURL: footerImg }); }
        if(footer == null && footerImg != null) { err = 'Il faut obligatoirement un footer text pour mettre une image !'; logger.error(err); }
        if(timestamp == true) { emb.setTimestamp(); }
        if(title == null && url == null && desc == null && color == null && thumb == null && img == null && author == null && authorImg == null && authorLink == null && footer == null && footerImg == null && timestamp == null) { err = 'Il faut obligatoirement un titre pour générer un embed !'; logger.error(err); }

        var errEmb = new EmbedBuilder();

        if(err == null) { return emb; } else {
            errEmb.setTitle('Une erreur est survenue lors de la génération de l\'embed')
            .setFields({ name: 'Raison:', value: err })
            .setColor('#ff0000');
            return errEmb;
        };
    },
}