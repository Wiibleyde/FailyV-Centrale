# Manuel de la nouvelle version de la centrale

Ce ... l'intranet du LSMS accueille une nouvelle version de la centrale. Cette page a pour but de vous aider à vous familiariser avec cette nouvelle version.

## Les nouveautés

### Un nouveau design

La nouvelle version de la centrale a été entièrement repensée pour être plus agréable à utiliser. Elle est maintenant plus claire et plus intuitive. Elle est aussi plus rapide et plus stable.

### Des nouvelles fonctionnalités

La nouvelle version de la centrale apporte son lot de nouvelles fonctionnalités. En voici quelques unes:
- Les rendez-vous généraux
- La prise des rendez-vous sans réaction
- Le nombre de fois où une personne a été contactée avec un bouton
- ...

Et d'autres sont à venir.

## Fonctionnement du #gestion-du-service

### Service

La prise de service se fait comme avant. Il suffit d'aller dans le #gestion-du-service et de cliquer sur le bouton "Service".
Pour quitter le service, il suffit de recliquer sur le bouton "Service" si vous êtes en service.

### Dispatch

La prise de dispatch se fait comme avant. Il suffit d'aller dans le #gestion-du-service et de cliquer sur le bouton "Dispatch".
Pour quitter le dispatch, il suffit de recliquer sur le bouton "Dispatch" si vous êtes en dispatch.

### Mal de tête

Si vous avez un gros mal de tête, vous pouvez cliquer sur le bouton "Aie la tête" dans le #gestion-du-service. Cela vous mettra en indisponible et les personnes en service pourront vous voir en indisponible.
Quand vous n'avez plus mal à la tête, il suffit de recliquer sur le bouton "Aie la tête" pour revenir en disponible.

### Gérer le service 

Pour gèrer les docteurs en service, il suffit d'aller dans le #gestion-du-service et de cliquer sur le bouton "⚙️". Cela vous permettra de voir les docteurs en service et de les retirer du service si besoin.
NB: Retirer quelqu'un du service, le retire aussi du dispatch.

## Fonctionnement du #centrale

### Les radios

Pour voir les radios, il suffit d'aller dans le #centrale vous verrez alors les radios qui sont en utilisation dans le service. Vous pouvez cliquer sur le bouton correspondant au service pour regénérer une fréquence radio.
> NB: Les fréquences radios sont générées aléatoirement et ne sont pas réelles.  
> NB2: Un changement de fréquence radio est signalé par un message qui va notifier les docteurs en service.

### Les lits

Pour voir les lits, il suffit d'aller dans le #centrale vous verrez alors les lits qui sont en utilisation dans le service. 
Pour ajouter une personne sur un lit, il suffit d'executer la commande `/lit`, de renseigner le nom de la personne, la lettre du lit et si il est sous surveillance LSPD (optionnel).
Pour retirer une personne d'un lit, il suffit de cliquer sur le bouton correspondant à la lettre du lit.

## Fonctionnement des rendez-vous

### Prendre un rendez-vous

Pour voir les rendez-vous généraux, il suffit d'aller d'éxecuter la commande `/rdv` dans le #centrale. Vous aurez alors le choix entre les 3 type de rendez-vous :
- Généraux : "Créer un rendez-vous général"
- Chirurgie : "Créer un rendez-vous de chirurgie"
- Psychologie : "Créer un rendez-vous de psychologie"

Vous verrez ensuite un formulaire à remplir pour créer le rendez-vous, il faudra renseigner : 
- Nom et prénom de la personne
- Numéro de téléphone de la personne
- Description du rendez-vous

Et vous pourrez ensuite valider le rendez-vous et il sera mis dans la liste des rendez-vous correspondant au type de rendez-vous.
- Généraux : #rdv-généraux
- Chirurgie : #rdv-chirurgie
- Psychologie : #rdv-psychologie

### Indiquer un contact de la personne sans réponse

Pour indiquer un contact de la personne sans avoir eu de réponse, il suffit de cliquer sur le bouton "Personne contactée" sous le message du rendez-vous. Cela indiquera que la personne a été contactée et un compteur de nombre de fois où la personne a été contactée sera affiché.

### Indiquer que l'on prend un rendez-vous

Pour indiquer que l'on prend un rendez-vous, il suffit de cliquer sur le bouton "Rendez-vous pris" sous le message du rendez-vous. Cela indiquera que la le rendez-vous n'est plus à contacter et qui le prend.

### Indiquer que l'on a terminé/annulé un rendez-vous

Pour indiquer que l'on a terminé/annulé un rendez-vous, il suffit de cliquer sur le bouton "Terminer/Supprimer" sous le message du rendez-vous. Cela enlèvera le rendez-vous de la liste des rendez-vous.
> NB: Cliquer sur le bouton "Terminer/Supprimer" supprimera le rendez-vous définitivement.

### Vérifier les rendez-vous

Pour vérifier que tous les rendez-vous sont présents dans chaque channel, il suffit de faire la commande `/rdv` et de choisir l'option "Voir le nombre de rendez-vous actuels". Cela vous affichera le nombre de rendez-vous dans chaque catégorie de rendez-vous.
Vous pourrez ainsi voir si il y a des rendez-vous en moins dans un channel.

### Remettre un rendez-vous supprimé par erreur

Pour retrouver un rendez-vous supprimé par erreur (sans passer par le bouton "Terminer/Supprimer"), il suffit de faire la commande `/rdv` et de choisir l'option "Régénérer les rendez-vous". La centrale va alors régénérer tous les rendez-vous et les remettre dans les channels correspondants.

## Gestion des docteurs 

### Ajouter un docteur

Pour ajouter un docteur, il suffit de faire la commande `/add` et de renseigner le nom, prénom, telephone, et le tag sur l'intranet du docteur. Cela va alors ajouter le docteur dans la liste des docteurs, lui donner les permissions pour voir les channels du LSMS et fais une annonce dans le channel #annonces.
> NB: On peut aussi ajouter un docteur en faisant la commande `/add` et en précisant le grade du docteur dans un argument optionnel.

### Mettre/retirer un docteur en vacances

Pour mettre un docteur en vacances, il suffit de faire la commande `/vacances` et de renseigner le docteur à mettre en vacances. Cela va alors mettre le docteur en vacances et lui retirer les permissions pour voir les channels du LSMS.
Pour retirer un docteur en vacances, il suffit de faire la commande `/vacances` et de renseigner le docteur à retirer des vacances. Cela va alors retirer le docteur des vacances et lui redonner les permissions pour voir les channels du LSMS.

### Gestion de l'effectif

#### Modifier l'effectif

L'effectif est géré automatiquement, si vous voulez ajouter un docteur, passez par la commande [/add](#ajouter-un-docteur).
> NB : Si l'effectif vous semble incorrect, vous pouvez utiliser la commande `/regenerate_workforce` qui va regénérer l'effectif.

## Gestion des véhicules

Pour ajouter un véhicule, il suffit de faire la commande `/vehicule`. Vous aurez le choix de :
- Ajouter
- Regénérer
- Supprimer

### Ajouter un véhicule

Pour ajouter un véhicule, il suffit de faire la commande `/vehicule` et de choisir l'option "Ajouter". Vous aurez alors un formulaire à remplir pour ajouter le véhicule, il faudra renseigner :
- Nom du véhicule
- Plaque du véhicule
- Date du contrôle technique
- Type de véhicule

Et vous pourrez ensuite valider le véhicule et il sera mis dans la liste des véhicules.

### Regénérer les véhicules

Pour regénérer les véhicules, il suffit de faire la commande `/vehicule` et de choisir l'option "Regénérer". Cela va alors regénérer tous les véhicules et les remettre dans la liste des véhicules.

### Supprimer un véhicule

Pour supprimer un véhicule, il suffit de faire la commande `/vehicule` et de choisir l'option "Supprimer". Vous aurez alors un message avec un choix multiple, et il faudra sélectionner le nom du véhicule.

## Gestion de l'agenda

### Ajouter un décès

Pour ajouter un décès, il suffit de faire la commande `/agenda` et de renseigner :
- Identité de la personne
- Personnes resposables
- Personnes autorisées
- Confidentialité (décès public ou privé)
- Donneur d'organe (oui ou non)
- Traitement de la dépouille
- Service qui a géré l'intervention (LSMS/BCMS)
- Optionnels :
    - D'autres informations à générer
    - Date du décès personnalisée (par défaut Chantrale prends la date du jour)

Cette commande va poster un message dans le canal #agenda, poster les informations pour le LSPD et la mairie.

### Indiquer le contact des responsables

Pour définir la date de la cérémonie ou de la récupération de l'urne, il suffit de cliquer sur le bouton `Responsables contactés`, ce bouton va indiquer que la personne a été contacté, qui l'a fait et combien de fois, cela a été fait.

### Indiquer une date de cérémonie / incinération

Pour indiquer une date de cérémonie ou d'incinération, il suffit de cliquer sur le bouton `Définir la date`, va supprimer le message et créér un évenement de l'intranet.

### Supprimer un message

Pour supprimer un message, il suffit de cliquer sur le bouton `Supprimer`, cela va supprimer le message.

## Inspection

### Ajouter une inspection

Pour ajouter une inspection, il suffit de faire la commande `/inspection` et de choisir l'option "Ajouter ou mettre à jour une inspecrion". Vous aurez alors un formulaire à remplir pour ajouter l'inspection, il faudra renseigner :
- Nom de l'entreprise
- Les docteurs qui ont participé à l'inspection
- La date de l'inspection (laisser vide pour mettre la date du jour)

### Supprimer une inspection

Pour supprimer une inspection, il suffit de faire la commande `/inspection` et de choisir l'option "Supprimer une inspection". Vous aurez alors un message avec un choix multiple, et il faudra sélectionner le nom de l'entreprise.

### Voir les inspections

Pour voir les inspections, il suffit de faire la commande `/inspection` et de choisir l'option "Voir les inspections". Vous aurez alors un message avec toutes les inspections.
