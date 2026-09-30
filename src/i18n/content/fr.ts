import type { LocaleContent } from './types';

const PRIVACY: [string, string] = ['Où a lieu le traitement', 'Dans le navigateur de votre appareil. Les fichiers ne sont jamais envoyés.'];
const SIZE: [string, string] = ['Limites', 'Jusqu’à 100 Mo par fichier, 50 fichiers par lot'];
const RASTER = 'JPG, PNG, WebP, AVIF, GIF (première image), BMP';

export const fr: LocaleContent = {
  tools: {
    'image-compressor': {
      name: 'Compresseur d’images',
      h1: 'Compresseur d’images',
      title: 'Compresser une image – Réduire JPG, PNG et WebP sans envoi',
      description: 'Réduisez le poids de vos JPG, PNG et WebP dans le navigateur : compression par lot, comparaison avant/après. Gratuit, sans inscription ni envoi de fichiers.',
      tagline: 'Allégez vos JPG, PNG et WebP sans perte de qualité visible.',
      searchTerms: ['compresser', 'réduire', 'alléger', 'poids', 'taille', 'optimiser'],
    },
    'compress-image-to-kb': {
      name: 'Compresser à une taille précise',
      h1: 'Compresser une image à une taille précise (Ko)',
      title: 'Compresser une image à 20 Ko, 50 Ko, 100 Ko… – Gratuit',
      description: 'Compressez une photo sous 20 Ko, 50 Ko, 100 Ko, 200 Ko ou toute autre limite d’envoi. Fonctionne sur mobile et tout se passe dans votre navigateur.',
      tagline: 'Indiquez une taille maximale et obtenez la meilleure qualité qui tient dedans.',
      searchTerms: ['ko', 'kb', '100 ko', '50 ko', '20 ko', 'taille maximale', 'photo d’identité', 'dossier', 'limite'],
    },
    'image-resizer': {
      name: 'Redimensionner une image',
      h1: 'Redimensionner une image',
      title: 'Redimensionner une image – En pixels ou en pourcentage, gratuit',
      description: 'Redimensionnez des images JPG, PNG, WebP et AVIF en pixels ou en pourcentage, proportions conservées, par lot et sans envoi. Téléchargement immédiat.',
      tagline: 'Modifiez la largeur et la hauteur d’une ou de plusieurs images, en pixels ou en pourcentage.',
      searchTerms: ['redimensionner', 'dimensions', 'pixels', 'réduire', 'agrandir', 'largeur', 'hauteur', 'résolution'],
    },
    'image-converter': {
      name: 'Convertisseur d’images',
      h1: 'Convertisseur d’images',
      title: 'Convertisseur d’images – WebP, PNG, JPG, AVIF, GIF, BMP en ligne',
      description: 'Convertissez entre JPG, PNG et WebP, et ouvrez aussi AVIF, GIF et BMP. Conversion par lot dans votre navigateur : gratuit, sans inscription, respectueux de la vie privée.',
      tagline: 'Transformez presque n’importe quelle image en JPG, PNG ou WebP en une seule étape.',
      searchTerms: ['convertir', 'format', 'extension', 'avif', 'bmp', 'gif', 'jpeg'],
    },
    'webp-to-jpg': {
      name: 'WebP en JPG',
      h1: 'Convertir WebP en JPG',
      title: 'Convertir WebP en JPG – Gratuit, par lot, sans envoi',
      description: 'Convertissez vos WebP en JPG compatibles avec toutes les applications et formulaires. Par lot, qualité et couleur de fond au choix, dans le navigateur.',
      tagline: 'Transformez les images WebP enregistrées depuis le web en JPG classiques.',
      searchTerms: ['webp', 'jpeg', 'enregistrer', 'convertir en jpg', 'webp en png'],
    },
    'png-to-jpg': {
      name: 'PNG en JPG',
      h1: 'Convertir PNG en JPG',
      title: 'Convertir PNG en JPG – Couleur de fond au choix, gratuit et sûr',
      description: 'Convertissez des PNG en JPG dans votre navigateur. Choisissez la couleur de fond des zones transparentes et la qualité du JPG. Conversion par lot, sans envoi ni inscription.',
      tagline: 'Transformez captures d’écran et visuels PNG en JPG plus légers.',
      searchTerms: ['png', 'jpeg', 'transparent', 'capture d’écran', 'alléger'],
    },
    'jpg-to-png': {
      name: 'JPG en PNG',
      h1: 'Convertir JPG en PNG',
      title: 'Convertir JPG en PNG – Sortie sans perte, gratuit, sans envoi',
      description: 'Convertissez des images JPG en PNG dans votre navigateur, avec des explications sur ce que PNG change ou non (qualité, transparence). Conversion par lot, gratuite et privée.',
      tagline: 'Enregistrez vos JPG en PNG sans perte pour les retouches ou les applications qui exigent du PNG.',
      searchTerms: ['jpg', 'jpeg', 'png', 'sans perte', 'transparent'],
    },
    'image-to-webp': {
      name: 'JPG et PNG en WebP',
      h1: 'Convertir JPG et PNG en WebP',
      title: 'Convertir JPG et PNG en WebP – Avec ou sans perte, gratuit',
      description: 'Convertissez JPG et PNG en WebP pour accélérer votre site. Mode avec ou sans perte, conversion par lot, et un vrai WebP même quand Safari ne sait pas en créer. Sans envoi.',
      tagline: 'Créez des images WebP plus légères pour votre site ou votre blog.',
      searchTerms: ['webp', 'jpg en webp', 'png en webp', 'site web', 'vitesse', 'optimiser'],
    },
    'image-to-pdf': {
      name: 'Image en PDF',
      h1: 'Image en PDF (JPG en PDF)',
      title: 'JPG en PDF – Plusieurs images dans un seul PDF, gratuit',
      description: 'Rassemblez des images JPG, PNG, WebP et AVIF dans un seul PDF. Réordonnez les pages, choisissez A4 ou Letter et les marges. Les JPG gardent leur qualité d’origine. Sans envoi.',
      tagline: 'Rassemblez photos et numérisations dans un seul document PDF.',
      searchTerms: ['pdf', 'jpg en pdf', 'png en pdf', 'assembler', 'fusionner', 'numérisation', 'document', 'photo en pdf'],
    },
    'image-cropper': {
      name: 'Recadrer une image',
      h1: 'Recadrer une image',
      title: 'Recadrer une image – Carré, 16:9, 4:5 ou libre, gratuit',
      description: 'Recadrez vos photos en carré, 16:9, 4:5 ou toute autre taille. Poignées tactiles et saisie au pixel près. Traitement dans votre navigateur, sans envoi.',
      tagline: 'Recadrez une image exactement à la zone et au format voulus.',
      searchTerms: ['recadrer', 'rogner', 'découper', 'carré', 'format', 'photo de profil'],
    },
    'rotate-image': {
      name: 'Pivoter une image',
      h1: 'Pivoter et retourner une image',
      title: 'Pivoter une image – 90°, 180° ou effet miroir, gratuit',
      description: 'Faites pivoter une image de 90° ou 180°, ou retournez-la horizontalement ou verticalement. Corrigez d’un coup les photos couchées. Gratuit, dans votre navigateur, sans envoi.',
      tagline: 'Corrigez les photos couchées ou inversées, une par une ou par lot.',
      searchTerms: ['pivoter', 'tourner', 'rotation', 'retourner', 'miroir', 'à l’envers', 'orientation'],
    },
    'exif-viewer': {
      name: 'Lecteur EXIF',
      h1: 'Lecteur EXIF – Voir les métadonnées d’une photo',
      title: 'Lecteur EXIF – Métadonnées et position GPS d’une photo',
      description: 'Affichez les informations cachées d’une photo : appareil, date de prise de vue, position GPS, objectif et réglages. JPG, HEIC, PNG et WebP. Rien n’est envoyé.',
      tagline: 'Découvrez ce qu’une photo cache : appareil, date et position GPS.',
      searchTerms: ['exif', 'métadonnées', 'gps', 'localisation', 'appareil photo', 'date de prise de vue', 'infos photo'],
    },
    'remove-exif': {
      name: 'Supprimer les EXIF',
      h1: 'Supprimer les EXIF et la position d’une photo',
      title: 'Supprimer EXIF et position GPS d’une photo – Sans perte, gratuit',
      description: 'Supprimez position GPS, infos d’appareil et autres métadonnées de vos JPG, PNG et WebP sans recompression. Par lot ; vos photos restent dans le navigateur.',
      tagline: 'Retirez la position et les infos d’appareil avant de partager, sans perte de qualité.',
      searchTerms: ['exif', 'métadonnées', 'gps', 'localisation', 'vie privée', 'supprimer', 'géolocalisation'],
    },
  },
  content: {
    'image-compressor': {
      intro: [
        'Les grandes photos sont lentes à envoyer par e-mail, encombrent le stockage et sont souvent refusées par les sites. Cet outil réencode vos images à la qualité choisie et peut aussi limiter leurs dimensions en pixels — pour les photos de téléphone, c’est souvent ce qui fait le plus gagner.',
        'Chaque résultat affiche la taille avant et après. Si un fichier est déjà bien optimisé et deviendrait plus lourd en le recompressant, l’outil vous rend l’original plutôt qu’une copie plus lourde et de moins bonne qualité.',
      ],
      steps: [
        'Choisissez ou déposez un ou plusieurs fichiers JPG, PNG, WebP ou BMP. La compression démarre aussitôt avec des réglages équilibrés.',
        'Ajustez la qualité, le format de sortie et la taille maximale. Jusqu’à 3 images, les résultats se mettent à jour automatiquement ; au-delà, cliquez sur « Appliquer les réglages ».',
        'Utilisez « Comparer » pour vérifier par rapport à l’original, puis téléchargez les fichiers un par un ou tous ensemble en ZIP.',
      ],
      useCases: [
        { title: 'Pièces jointes', text: 'Réduisez d’un coup des photos de téléphone de 5 Mo pour en faire tenir une douzaine sous la limite de 25 Mo.' },
        { title: 'Sites plus rapides', text: 'Allégez images d’en-tête et photos de blog. Dans les navigateurs récents, la sortie WebP est la plus légère.' },
        { title: 'Captures d’écran et visuels', text: 'Les captures PNG aux aplats de couleur réduites à une palette de 256 couleurs perdent souvent 60 à 80 % de leur poids, transparence comprise.' },
      ],
      specs: [
        ['Formats d’entrée', 'JPG/JPEG, PNG, WebP, BMP'],
        ['Formats de sortie', 'Identique à l’original, JPG, WebP, PNG'],
        ['Méthode JPG / WebP', 'Réencodage à la qualité choisie (10–95 %) par l’encodeur intégré du navigateur ; sur Safari/iOS, WebP est produit par un encodeur WebAssembly'],
        ['Méthode PNG', 'Réduction à une palette de 32 à 256 couleurs (avec perte, transparence conservée) ou réencodage sans perte'],
        ['Redimensionnement (facultatif)', 'Côté le plus long limité entre 800 et 3840 px ; les petites images ne sont pas agrandies'],
        ['Métadonnées', 'Les fichiers réencodés ne contiennent aucune donnée EXIF/GPS'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'La compression se fait avec perte. À très basse qualité, les JPG et WebP montrent des blocs ou du flou : vérifiez avec « Comparer » avant de télécharger.',
        'Les GIF animés et les fichiers HEIC (iPhone) ne sont pas pris en charge. Exportez d’abord vos photos d’iPhone en JPG.',
        'Les profils de couleur sont convertis en sRGB standard. Les photos à large gamut (Display P3) peuvent paraître légèrement moins saturées sur un écran large gamut.',
        'Les très grandes images (au-delà d’environ 16 mégapixels sur iPhone/iPad) sont réduites automatiquement pour respecter la mémoire du navigateur, et un message l’indique.',
      ],
      faq: [
        { q: 'Mes images sont-elles envoyées sur un serveur ?', a: 'Non. Elles sont lues et réencodées dans le navigateur de votre appareil (dans un worker en arrière-plan). La page n’a aucun point d’envoi et sa politique de sécurité bloque tout envoi de données vers d’autres sites.' },
        { q: 'Quelle qualité choisir ?', a: 'Pour les photos, 70 à 80 % donnent un résultat presque impossible à distinguer de l’original à l’œil nu, avec un fichier bien plus léger. Pour les images contenant du texte, utilisez 85 % ou le PNG.' },
        { q: 'Pourquoi un fichier est-il revenu inchangé ?', a: 'Si la compression avec vos réglages produisait un fichier plus lourd que l’original (fréquent avec des JPG déjà optimisés), l’outil garde l’original pour ne pas vous remettre un fichier plus lourd et de moins bonne qualité.' },
        { q: 'Le WebP est-il meilleur que le JPG ?', a: 'À qualité comparable, le WebP est en général 25 à 35 % plus léger et tous les navigateurs actuels le lisent. Mais d’anciennes applications et beaucoup de formulaires n’acceptent que le JPG : dans le doute, gardez le JPG.' },
        { q: 'La compression efface-t-elle la position de la photo ?', a: 'Oui. L’image réencodée est reconstruite à partir des seuls pixels : coordonnées GPS, modèle d’appareil, date et autres données EXIF ne sont pas copiés. Pour supprimer les métadonnées sans recompresser, utilisez « Supprimer les EXIF ».' },
      ],
    },

    'compress-image-to-kb': {
      intro: [
        'Demandes de passeport ou de visa, concours, candidatures, sites administratifs : beaucoup refusent les photos au-delà de 20 Ko, 50 Ko ou 100 Ko. Deviner la qualité et recommencer fait perdre du temps. Cet outil cherche la meilleure qualité qui respecte la limite que vous indiquez.',
        'Il essaie d’abord en haute qualité et en taille réelle, puis baisse progressivement la qualité JPG/WebP si le fichier est trop lourd. Il ne réduit les dimensions que si même la qualité minimale ne suffit pas. La taille finale est affichée à l’octet près pour la comparer aux exigences du formulaire.',
      ],
      steps: [
        'Choisissez un préréglage (20 Ko, 50 Ko, 100 Ko, 200 Ko, 500 Ko, 1 Mo) ou saisissez votre limite.',
        'Choisissez ou déposez vos photos : JPG, PNG, WebP et d’autres formats sont acceptés.',
        'Téléchargez le résultat. Le nombre exact d’octets est affiché, ainsi que le respect ou non de la limite.',
      ],
      useCases: [
        { title: 'Passeport et visa', text: 'De nombreux dossiers en ligne exigent un JPG de moins de 100 à 240 Ko. Si des dimensions en pixels sont aussi imposées, recadrez d’abord.' },
        { title: 'Concours et sites d’emploi', text: 'Les envois de signature ou de photo peuvent être limités à 10–50 Ko. Recadrez d’abord les marges pour consacrer la qualité à ce qui reste.' },
        { title: 'Messageries et forums', text: 'Pour les sites qui limitent avatars ou pièces jointes à 500 Ko ou 1 Mo, fixez la limite une fois et traitez plusieurs images.' },
      ],
      specs: [
        ['Formats d’entrée', RASTER],
        ['Formats de sortie', 'JPG (par défaut) ou WebP'],
        ['Méthode d’ajustement', 'Recherche dichotomique sur la qualité (40–92 %), puis réduction proportionnelle si nécessaire'],
        ['Définition du Ko', '1 Ko = 1 000 octets. Un résultat « 100 Ko » fait au plus 100 000 octets et passe donc aussi les formulaires qui comptent 1 Ko = 1 024 octets'],
        ['Limite minimale', '5 Ko'],
        ['Métadonnées', 'Aucune donnée EXIF/GPS dans le fichier produit'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Avec des limites très basses (moins d’environ 20 Ko), il faut réduire les dimensions et l’image peut devenir floue. Recadrez d’abord le fond pour garder un visage ou une signature nets.',
        'Si le formulaire impose aussi des dimensions exactes (par ex. 600 × 600), redimensionnez ou recadrez d’abord, puis compressez à la taille voulue.',
        'Le JPG ne gère pas la transparence : les zones transparentes deviennent blanches.',
        'Les fichiers HEIC (iPhone) ne sont pas encore pris en charge. Dans Safari sur iPhone, une photo choisie dans la photothèque est généralement fournie en JPG.',
      ],
      faq: [
        { q: 'Comment compresser une photo à exactement 100 Ko ?', a: 'Choisissez « 100 Ko », puis sélectionnez la photo. Vous obtenez la meilleure qualité qui tient dans 100 000 octets. Les formulaires vérifient seulement que la limite n’est pas dépassée : inutile d’être pile à 100 Ko, le résultat est en général un peu en dessous.' },
        { q: 'Que faire si « Impossible d’atteindre la taille cible » s’affiche ?', a: 'Cela arrive avec des limites très basses et des images très détaillées. Recadrez à la zone utile ou, si le formulaire le permet, choisissez une limite un peu plus haute.' },
        { q: 'Pourquoi mon fichier de 100 Ko affiche-t-il 97,6 Ko sur l’ordinateur ?', a: 'Selon le système, 1 Ko vaut 1 000 ou 1 024 octets. L’outil respecte la limite dans les deux cas, donc un fichier de 100 000 octets peut s’afficher comme 97,6 Ko sous Windows.' },
        { q: 'Les photos prises avec un iPhone fonctionnent-elles ?', a: 'Oui dans la plupart des cas : dans Safari sur iPhone, une photo choisie dans la photothèque est fournie en JPG. Les fichiers HEIC copiés sur un ordinateur ne sont pas encore pris en charge : exportez-les en JPG ou choisissez « Réglages → Appareil photo → Formats → Le plus compatible ».' },
        { q: 'Est-ce sûr pour une photo de pièce d’identité ou de passeport ?', a: 'Les photos sont traitées entièrement sur votre appareil et ne sont jamais envoyées à un serveur. En fermant l’onglet, rien ne reste.' },
      ],
    },

    'image-resizer': {
      intro: [
        'Redimensionnez des images à des dimensions précises en pixels, à un pourcentage de l’original, ou pour qu’elles tiennent dans un cadre comme 1920 × 1080, en conservant les proportions. La même règle s’applique à toutes les images du lot : préparez d’un coup les photos d’un site ou d’une boutique en ligne.',
        'Les fortes réductions se font par étapes, avec un rééchantillonnage de haute qualité, ce qui limite les effets d’escalier d’une réduction en une seule fois.',
      ],
      steps: [
        'Choisissez ou déposez vos images.',
        'Dans « Pixels », saisissez la largeur et/ou la hauteur ou choisissez un préréglage, ou bien sélectionnez « Pourcentage ». Les nouvelles dimensions de la première image s’affichent en aperçu.',
        'Cliquez sur « Redimensionner », puis téléchargez les images une par une ou en ZIP.',
      ],
      useCases: [
        { title: 'Sites et boutiques en ligne', text: 'Une photo produit prise au téléphone fait souvent 4000 px de large, alors que 1200 à 2000 px suffisent à la plupart des sites et se chargent bien plus vite.' },
        { title: 'Réseaux sociaux', text: 'Préréglages pour les publications carrées 1080 × 1080, portrait 1080 × 1350 et les stories 1080 × 1920. L’image est réduite pour tenir dans le cadre ; pour une forme exacte, utilisez le recadrage.' },
        { title: 'Formulaires avec dimensions maximales', text: 'Pour une exigence du type « 800 × 600 px maximum », activez « Conserver les proportions » et saisissez les deux valeurs : l’image tiendra sans être coupée.' },
      ],
      specs: [
        ['Formats d’entrée', RASTER],
        ['Modes', 'Largeur/hauteur en pixels (ajuster au cadre ou étirer) ou pourcentage (1–400 %)'],
        ['Taille de sortie maximale', '20 000 px par côté (et limite mémoire du navigateur)'],
        ['Agrandissement', 'Désactivé par défaut (« Ne pas agrandir les images déjà plus petites »)'],
        ['Formats de sortie', 'Identique à l’original, JPG, PNG, WebP (avec « Identique », AVIF→JPG, GIF/BMP→PNG)'],
        ['Rééchantillonnage', 'Réductions successives de moitié + lissage haute qualité du navigateur'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Agrandir une image n’ajoute pas de détails : une image agrandie paraît floue.',
        'Avec « Conserver les proportions », l’image est ajustée dans le cadre largeur × hauteur, donc un côté peut être plus petit que la valeur saisie. Sans cette option, l’image est étirée. Pour un format exact, utilisez l’outil de recadrage.',
        'Les GIF et WebP animés sont redimensionnés comme des images fixes (première image).',
      ],
      faq: [
        { q: 'Comment redimensionner sans perdre en qualité ?', a: 'Réduire enlève forcément des pixels, mais avec un rééchantillonnage de haute qualité et un JPG à 90 % (par défaut), l’image reste nette à sa nouvelle taille. Pour les visuels et captures d’écran, choisissez une sortie PNG sans perte.' },
        { q: 'Puis-je redimensionner beaucoup d’images à la fois ?', a: 'Oui : jusqu’à 50 images par lot, avec les mêmes réglages pour toutes, téléchargeables dans un seul fichier ZIP.' },
        { q: 'Que signifie « Conserver les proportions » ?', a: 'Le rapport entre largeur et hauteur est préservé pour que personnes et objets ne soient pas déformés. Si vous saisissez largeur et hauteur, l’image est réduite pour tenir dans ce cadre.' },
        { q: 'Redimensionner réduit-il aussi le poids du fichier ?', a: 'En général, beaucoup. Diviser largeur et hauteur par deux laisse un quart des pixels, et le fichier perd typiquement 60 à 75 % de son poids.' },
      ],
    },

    'image-converter': {
      intro: [
        'Un convertisseur tout-en-un pour les formats d’image du quotidien : ouvrez AVIF et WebP venus du web, PNG et JPG, GIF et BMP, et enregistrez-les en JPG, PNG ou WebP. Même avec des fichiers de formats différents, tout est converti avec les mêmes réglages de sortie.',
        'Les conversions les plus courantes ont leur propre page avec plus d’explications : WebP en JPG, PNG en JPG, JPG en PNG, et JPG/PNG en WebP.',
      ],
      steps: [
        'Choisissez le format de sortie : JPG, PNG ou WebP.',
        'Choisissez ou déposez vos images : la conversion démarre aussitôt.',
        'Téléchargez les fichiers convertis un par un ou en ZIP.',
      ],
      useCases: [
        { title: 'Dossiers de formats mélangés', text: 'Convertissez d’un coup en JPG un mélange d’AVIF, WebP et PNG pour une application ou une imprimante qui n’accepte que le JPG.' },
        { title: 'Garder la transparence', text: 'En sortie PNG ou WebP, les fonds transparents des PNG, WebP, GIF et AVIF sont conservés.' },
        { title: 'Formats récents', text: 'Rendez les AVIF et WebP utilisés sur le web lisibles par les anciens logiciels.' },
      ],
      specs: [
        ['Formats d’entrée', `${RASTER} ; TIFF uniquement dans les navigateurs compatibles (Safari)`],
        ['Formats de sortie', 'JPG, PNG, WebP (avec ou sans perte)'],
        ['Transparence', 'Conservée en PNG/WebP ; remplie par la couleur de votre choix en JPG'],
        ['Détection du format', 'D’après le contenu du fichier, pas son extension'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Les GIF/WebP/PNG animés sont convertis en une seule image fixe.',
        'Les fichiers HEIC (iPhone) ne sont pas encore pris en charge et la sortie AVIF n’est pas disponible (les navigateurs ne savent pas encore l’encoder).',
        'SVG, PDF, RAW et PSD ne sont pas pris en charge.',
      ],
      faq: [
        { q: 'Quel format choisir ?', a: 'JPG pour les photos qui doivent s’ouvrir partout ; PNG pour les captures d’écran, logos et images transparentes ; WebP pour le poids le plus faible sur un site web.' },
        { q: 'Pourquoi un fichier .jpg a-t-il été refusé ?', a: 'L’outil vérifie le contenu réel de chaque fichier. Renommer un PDF ou une page web en .jpg n’en fait pas une image : ces fichiers sont refusés par sécurité.' },
        { q: 'Puis-je convertir des images AVIF ?', a: 'Oui, si votre navigateur sait afficher l’AVIF (Chrome, Edge, Firefox récents et Safari 16 ou ultérieur).' },
      ],
    },

    'webp-to-jpg': {
      intro: [
        'Beaucoup de sites servent leurs images en WebP : « Enregistrer l’image sous » donne alors un fichier .webp que d’anciennes applications, certains logiciels de retouche et de nombreux formulaires refusent. Cet outil convertit le WebP en JPG classique (ou en PNG).',
        'Un WebP peut contenir des zones transparentes, ce que le JPG ne gère pas. Vous choisissez la couleur qui les remplit (blanc par défaut).',
      ],
      steps: [
        'Choisissez ou déposez un ou plusieurs fichiers .webp.',
        'Ils sont convertis aussitôt en JPG à 90 % de qualité. Modifiez la qualité ou la couleur de fond si besoin.',
        'Téléchargez les JPG un par un ou tous ensemble en ZIP.',
      ],
      useCases: [
        { title: 'Images enregistrées depuis le web', text: 'Rendez les images téléchargées utilisables dans Word, d’anciens logiciels de retouche ou des services de tirage photo.' },
        { title: 'Formulaires d’envoi', text: 'Convertissez le WebP en JPG pour les sites qui n’acceptent que JPG ou PNG.' },
        { title: 'WebP transparent en PNG', text: 'Pour garder un fond transparent, choisissez une sortie PNG plutôt que JPG.' },
      ],
      specs: [
        ['Format d’entrée', 'WebP (avec perte, sans perte, transparent ; animé : première image)'],
        ['Formats de sortie', 'JPG (par défaut) ou PNG'],
        ['Transparence', 'Remplie en blanc, noir ou couleur au choix en JPG ; conservée en PNG'],
        ['Qualité', '30–100 % (90 % par défaut)'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Les WebP animés sont convertis en une seule image fixe (la première).',
        'Le WebP compressant mieux, le JPG obtenu peut être plus lourd que le WebP d’origine.',
      ],
      faq: [
        { q: 'Pourquoi les sites utilisent-ils le WebP ?', a: 'À qualité comparable, un WebP est en général 25 à 35 % plus léger qu’un JPG, ce qui accélère les pages. Tous les navigateurs récents le lisent, mais certains logiciels de bureau non.' },
        { q: 'Convertir un WebP en JPG réduit-il la qualité ?', a: 'Le JPG est avec perte, donc légèrement, mais à 90 % la différence est invisible sur une image ordinaire. Pour éviter toute perte, choisissez la sortie PNG.' },
        { q: 'Puis-je convertir un WebP en PNG ici ?', a: 'Oui : choisissez PNG dans « Convertir en ». La transparence est conservée.' },
        { q: 'Peut-on convertir un WebP sans site web ?', a: 'Oui. Sous Windows, ouvrez-le dans Paint puis « Enregistrer sous → JPEG » ; sur Mac, dans Aperçu, Fichier → Exporter → JPEG. Cet outil est plus pratique pour convertir de nombreux fichiers d’un coup ou choisir la couleur des zones transparentes.' },
        { q: 'Pourquoi « Enregistrer l’image » donne-t-il un WebP ?', a: 'Le site envoie du WebP aux navigateurs qui le gèrent, et le navigateur enregistre le format reçu. Aucun réglage du navigateur ne change cela : convertir le fichier enregistré est la solution pratique.' },
      ],
    },

    'png-to-jpg': {
      intro: [
        'Le PNG est sans perte : les photos et les captures d’écran de photos y sont donc lourdes. En JPG, elles ne pèsent souvent plus qu’une fraction de leur poids — et le JPG est le format exigé par beaucoup de formulaires.',
        'Le JPG ne gère pas la transparence : les pixels transparents sont remplis par la couleur de votre choix. Blanc par défaut, mais un logo destiné à un fond sombre peut prendre du noir ou toute autre couleur.',
      ],
      steps: [
        'Choisissez ou déposez vos fichiers PNG.',
        'Choisissez la couleur de fond des zones transparentes et la qualité du JPG.',
        'Téléchargez les JPG un par un ou tous ensemble en ZIP.',
      ],
      useCases: [
        { title: 'Captures d’écran de photos', text: 'Une capture PNG d’une photo ou d’une vidéo devient souvent 3 à 10 fois plus légère en JPG.' },
        { title: 'Formulaires qui exigent du JPG', text: 'Convertissez numérisations et exports d’outils de design en JPG pour un dossier en ligne.' },
        { title: 'Logos sur fond coloré', text: 'Choisissez une couleur de fond assortie à l’endroit où l’image sera placée.' },
      ],
      specs: [
        ['Format d’entrée', 'PNG (y compris transparent et 16 bits ; APNG : première image)'],
        ['Format de sortie', 'JPG'],
        ['Transparence', 'Remplie par la couleur choisie (blanc par défaut)'],
        ['Qualité', '30–100 % (90 % par défaut)'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Le texte et les traits fins peuvent légèrement baver en JPG. Pour une capture de texte, la réduction de palette PNG du « Compresseur d’images » donne souvent un rendu plus net.',
        'Le JPG ne conserve pas la transparence. Pour un fichier léger et transparent, utilisez le WebP.',
      ],
      faq: [
        { q: 'Pourquoi le JPG est-il plus léger que le PNG ?', a: 'Le JPG abandonne des détails peu visibles dans les photos, alors que le PNG enregistre chaque pixel à l’identique. Pour une photo, le gain est généralement de 70 à 90 %.' },
        { q: 'Que devient le fond transparent ?', a: 'Il est remplacé par la couleur de fond choisie. Pour garder la transparence, convertissez en WebP ou restez en PNG.' },
        { q: 'Peut-on convertir un PNG en JPG sans perte de qualité ?', a: 'À 95–100 %, une photo paraît identique, mais le gain de poids est faible. 85 à 90 % offre un bon équilibre.' },
      ],
    },

    'jpg-to-png': {
      intro: [
        'Le PNG est sans perte : une fois l’image en PNG, les modifications et enregistrements successifs n’ajoutent plus de défauts de compression. Certaines applications, certains services d’impression et outils de design exigent aussi du PNG.',
        'Deux idées reçues : convertir un JPG en PNG ne récupère pas les détails déjà perdus par la compression JPG, et ne rend pas le fond transparent. Le PNG a exactement le même aspect que le JPG, pour un poids plusieurs fois supérieur.',
      ],
      steps: [
        'Choisissez ou déposez vos fichiers JPG.',
        'Chaque image est convertie aussitôt en PNG.',
        'Téléchargez les PNG un par un ou en ZIP.',
      ],
      useCases: [
        { title: 'Retoucher sans dégrader', text: 'Passez en PNG avant de modifier et d’enregistrer plusieurs fois : la qualité ne baissera plus à chaque enregistrement.' },
        { title: 'Applications qui exigent du PNG', text: 'Certains outils d’icônes, de stickers ou de design n’acceptent que le PNG.' },
        { title: 'Avant de détourer', text: 'Le PNG gère la transparence : c’est un bon format de travail si vous comptez supprimer le fond dans un logiciel de retouche.' },
      ],
      specs: [
        ['Format d’entrée', 'JPG / JPEG (orientation EXIF appliquée)'],
        ['Format de sortie', 'PNG (sans perte, 8 bits par canal)'],
        ['Évolution du poids', 'En général 3 à 8 fois celui du JPG pour une photo'],
        ['Métadonnées', 'Aucune donnée EXIF/GPS dans le fichier produit'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'La qualité n’est pas améliorée : les défauts du JPG restent visibles dans le PNG.',
        'Le fond reste opaque. Pour le rendre transparent, il faut un outil de suppression d’arrière-plan.',
        'Les JPG CMJN sont convertis en RVB.',
      ],
      faq: [
        { q: 'Convertir un JPG en PNG améliore-t-il la qualité ?', a: 'Non. Le PNG conserve l’image telle quelle, défauts de compression compris. Il évite seulement toute dégradation lors des enregistrements futurs.' },
        { q: 'Le fond du JPG deviendra-t-il transparent ?', a: 'Non. Le JPG ne contient aucune information de transparence, donc le PNG est entièrement opaque. Le fond doit être supprimé dans un logiciel de retouche.' },
        { q: 'Pourquoi le PNG est-il si lourd ?', a: 'Il enregistre chaque pixel sans perte. Les photos comportent énormément de variations fines, que la compression sans perte ne peut pas beaucoup réduire.' },
      ],
    },

    'image-to-webp': {
      intro: [
        'À qualité comparable, un WebP est en général 25 à 35 % plus léger qu’un JPG, et le WebP sans perte bat souvent le PNG. C’est un moyen simple d’accélérer un site ou un blog.',
        'Safari (et tous les navigateurs sur iPhone et iPad) ne sait pas encoder le WebP et renvoie discrètement un PNG. Cet outil le détecte et passe à un encodeur WebP WebAssembly intégré : vous obtenez toujours un vrai fichier .webp.',
      ],
      steps: [
        'Choisissez ou déposez des fichiers JPG, PNG, BMP ou GIF.',
        'Ils sont convertis en WebP à 80 % de qualité. Pour les logos, icônes et captures d’écran, activez « WebP sans perte ».',
        'Comparez les poids, puis téléchargez un par un ou en ZIP.',
      ],
      useCases: [
        { title: 'Vitesse du site', text: 'Remplacer JPG/PNG par du WebP allège les pages et améliore des indicateurs comme le Largest Contentful Paint.' },
        { title: 'Visuels transparents', text: 'Un logo PNG transparent converti en WebP garde sa transparence, avec ou sans perte.' },
        { title: 'Blogs et CMS', text: 'La plupart des CMS récents acceptent le WebP. Convertir avant l’envoi économise stockage et bande passante.' },
      ],
      specs: [
        ['Formats d’entrée', 'JPG, PNG, BMP, GIF (première image)'],
        ['Format de sortie', 'WebP — avec perte (qualité 30–100 %) ou sans perte'],
        ['Encodeur', 'Celui du navigateur s’il est disponible ; libwebp (WebAssembly) sur Safari/iOS et en mode sans perte'],
        ['Transparence', 'Conservée'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Un GIF animé devient un WebP fixe (première image).',
        'Un JPG déjà très compressé, réencodé en haute qualité, peut donner un WebP plus lourd. Baissez la qualité ou gardez le JPG.',
        'Certains anciens logiciels et clients de messagerie n’ouvrent pas le WebP : conservez les originaux.',
      ],
      faq: [
        { q: 'WebP avec ou sans perte ?', a: 'Avec perte pour les photos (bien plus léger). Sans perte pour les captures d’écran, logos, icônes et illustrations aux aplats et contours nets.' },
        { q: 'Tous les navigateurs affichent-ils le WebP ?', a: 'Oui : Chrome, Edge, Firefox et Safari récents affichent tous le WebP. Seuls de très vieux navigateurs comme Internet Explorer ne le gèrent pas.' },
        { q: 'Obtient-on un vrai WebP sur Safari ou iPhone ?', a: 'Oui, c’est prévu pour. Safari ne sait pas encoder le WebP et renvoie un PNG ; l’outil vérifie donc chaque résultat et, si ce n’est pas du WebP, l’encode sur votre appareil avec la version WebAssembly de libwebp de Google.' },
      ],
    },

    'image-to-pdf': {
      intro: [
        'Rassemblez photos, numérisations et captures d’écran dans un seul PDF : pratique pour envoyer un dossier, des justificatifs ou archiver des notes. Classez les pages dans l’ordre voulu et choisissez le format de papier et les marges.',
        'Les photos JPG sont intégrées telles quelles, sans recompression : aucune perte de qualité. Les PNG sont intégrés sans perte. Les autres formats (WebP, AVIF) sont d’abord convertis en JPG de haute qualité.',
      ],
      steps: [
        'Choisissez ou déposez vos images ; vous pourrez en ajouter d’autres ensuite.',
        'Réordonnez les pages avec les boutons ↑ ↓ et supprimez celles dont vous n’avez pas besoin.',
        'Choisissez A4, US Letter ou « Identique à l’image », l’orientation et les marges, puis cliquez sur « Créer le PDF » et téléchargez-le.',
      ],
      useCases: [
        { title: 'Envoyer un dossier', text: 'Rassemblez dans un seul PDF les photos de pièces d’identité, attestations ou formulaires prises au téléphone.' },
        { title: 'Notes de frais', text: 'Regroupez les photos de reçus d’un mois dans un seul PDF pour votre note de frais.' },
        { title: 'Notes et tableaux blancs', text: 'Transformez des photos de notes manuscrites ou de tableau blanc en un seul document facile à partager.' },
      ],
      specs: [
        ['Formats d’entrée', RASTER],
        ['Format de page', 'A4, US Letter ou identique à chaque image (96 px/pouce)'],
        ['Orientation', 'Automatique pour chaque image, ou fixée en portrait/paysage'],
        ['Marges', 'Aucune, petite (0,25 po), grande (0,5 po)'],
        ['Qualité', 'JPG intégrés sans recompression ; PNG sans perte ; autres formats convertis en JPG à 92 %'],
        ['Limites', '50 images par PDF, 100 Mo par image'],
        PRIVACY,
      ],
      limits: [
        'Le PDF ne contient que des images, sans texte recherchable (pas d’OCR).',
        'De grandes photos donnent un gros PDF. Pour l’alléger, réduisez d’abord les images avec « Compresser à une taille précise » ou « Redimensionner une image ».',
        'Les JPG porteurs d’une orientation EXIF sont réencodés en haute qualité pour s’afficher dans le bon sens.',
        'Les fichiers HEIC (iPhone) ne sont pas encore pris en charge.',
      ],
      faq: [
        { q: 'Comment réunir plusieurs JPG dans un seul PDF ?', a: 'Sélectionnez tous vos JPG (vous pouvez aussi les ajouter en plusieurs fois), mettez-les dans l’ordre et cliquez sur « Créer le PDF ». Chaque image devient une page.' },
        { q: 'La qualité des images baisse-t-elle ?', a: 'Non pour les JPG, intégrés octet pour octet, ni pour les PNG, intégrés sans perte. Les autres formats sont convertis en JPG à 92 %.' },
        { q: 'Peut-on créer un PDF sur mobile ?', a: 'Oui. L’outil fonctionne dans les navigateurs mobiles et vous pouvez choisir les images directement dans votre galerie.' },
        { q: 'Y a-t-il une limite de pages ?', a: 'Jusqu’à 50 images par PDF. Les grandes photos consomment beaucoup de mémoire, en particulier sur téléphone.' },
      ],
    },

    'image-cropper': {
      intro: [
        'Recadrez exactement la partie de la photo dont vous avez besoin : faites glisser le cadre ou ses poignées (compatible tactile), choisissez un format fixe (1:1 pour une photo de profil, 16:9 pour une miniature) ou saisissez position et dimensions au pixel près.',
        'Le recadrage s’applique à l’image en pleine résolution, pas à l’aperçu réduit affiché à l’écran.',
      ],
      steps: [
        'Choisissez ou déposez une image.',
        'Choisissez un format (ou libre), faites glisser le cadre ou ses coins, ou saisissez X, Y, largeur et hauteur.',
        'Cliquez sur « Recadrer », puis téléchargez ou copiez le résultat.',
      ],
      useCases: [
        { title: 'Photo de profil', text: 'Un carré centré en 1:1 pour les réseaux sociaux, les messageries ou une photo d’identité.' },
        { title: 'Publications et miniatures', text: '4:5 pour les publications portrait, 9:16 pour les stories, 16:9 pour les miniatures vidéo et les présentations.' },
        { title: 'Retirer le superflu', text: 'Coupez les bords, un passant à l’arrière-plan ou la partie d’une capture d’écran que vous ne voulez pas partager.' },
      ],
      specs: [
        ['Formats d’entrée', RASTER],
        ['Formats prédéfinis', 'Libre, original, 1:1, 4:3, 3:2, 16:9, 9:16, 4:5'],
        ['Précision', '1 pixel de l’image d’origine'],
        ['Sortie', 'Même format que l’original (AVIF→JPG), ou JPG/PNG/WebP'],
        ['Clavier', 'Flèches pour déplacer le cadre, Maj + flèches pour le redimensionner'],
        PRIVACY,
      ],
      limits: [
        'Une image à la fois.',
        'Les JPG et WebP sont enregistrés à 92 % de qualité. Pour éviter toute perte, choisissez PNG.',
      ],
      faq: [
        { q: 'Comment recadrer une photo en carré ?', a: 'Choisissez le format 1:1. Un carré apparaît au centre : déplacez-le, ajustez sa taille par les coins, puis cliquez sur « Recadrer ».' },
        { q: 'Le recadrage réduit-il la qualité ?', a: 'Le recadrage utilise les pixels d’origine tels quels. Les JPG/WebP sont enregistrés à 92 %, sans différence visible. Pour un résultat strictement sans perte, choisissez PNG.' },
        { q: 'Peut-on recadrer au pixel près ?', a: 'Oui : saisissez les valeurs dans les champs X, Y, largeur et hauteur. Pour changer aussi les dimensions finales, utilisez ensuite « Redimensionner une image ».' },
      ],
    },

    'rotate-image': {
      intro: [
        'Faites pivoter des photos de 90° ou 180°, ou retournez-les horizontalement ou verticalement : photos de téléphone couchées, documents numérisés à l’envers, selfies inversés. La même modification s’applique à toutes les images ajoutées, pour corriger une série de numérisations d’un coup.',
        'Avant d’appliquer, vous voyez le résultat en aperçu sur la première image.',
      ],
      steps: [
        'Choisissez ou déposez une ou plusieurs images.',
        'Cliquez sur les boutons de rotation et de retournement jusqu’à ce que l’aperçu soit correct.',
        'Cliquez sur « Pivoter », puis téléchargez un par un ou en ZIP.',
      ],
      useCases: [
        { title: 'Photos de téléphone couchées', text: 'Corrigez les photos qui s’affichent de côté dans certaines applications ou sur certains sites.' },
        { title: 'Documents numérisés', text: 'Faites pivoter d’un coup des pages numérisées à l’envers.' },
        { title: 'Selfies inversés', text: 'Retournez horizontalement une photo prise avec la caméra frontale pour que le texte se lise normalement.' },
      ],
      specs: [
        ['Formats d’entrée', RASTER],
        ['Opérations', 'Rotation de 90° à gauche/droite, 180°, retournement horizontal, vertical (combinables)'],
        ['Sortie', 'Même format que l’original (AVIF→JPG, GIF/BMP→PNG) ; JPG/WebP enregistrés à 92 %'],
        ['Orientation EXIF', 'Appliquée d’abord : la rotation part de l’image telle que vous la voyez'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Les JPG sont réencodés à 92 % de qualité : la rotation n’est donc pas strictement sans perte.',
        'Toutes les images d’un lot reçoivent la même rotation.',
      ],
      faq: [
        { q: 'Pourquoi ma photo est-elle droite sur mon téléphone mais de côté sur certains sites ?', a: 'Les téléphones enregistrent souvent la photo sans la faire pivoter et ajoutent un petit indicateur d’« orientation » ; les applications qui l’ignorent l’affichent de côté. En la faisant pivoter ici, les pixels sont écrits dans le bon sens : elle s’affiche correctement partout.' },
        { q: 'Quelle différence entre pivoter et retourner ?', a: 'Pivoter fait tourner l’image autour de son centre. Retourner crée un effet miroir : horizontal (gauche/droite) ou vertical (haut/bas).' },
        { q: 'Puis-je faire pivoter plusieurs images à la fois ?', a: 'Oui, jusqu’à 50. La même rotation et le même retournement s’appliquent à toutes.' },
      ],
    },

    'exif-viewer': {
      intro: [
        'Les photos de téléphone et d’appareil photo contiennent des informations cachées : appareil et objectif, date et heure exactes, réglages d’exposition, logiciel utilisé et souvent les coordonnées GPS du lieu de prise de vue. Ce lecteur les affiche toutes et vous avertit clairement si une position est présente.',
        'Le fichier est lu dans votre navigateur ; rien n’est envoyé. C’est essentiel, car ce sont souvent des photos personnelles que l’on veut vérifier.',
      ],
      steps: [
        'Choisissez ou déposez une photo (JPG, HEIC, PNG, WebP, AVIF, TIFF).',
        'Consultez le résumé et la vérification GPS en haut, puis ouvrez les groupes ci-dessous pour voir tous les champs.',
        'Copiez les métadonnées en texte, téléchargez-les en JSON ou supprimez-les avec « Supprimer les EXIF ».',
      ],
      useCases: [
        { title: 'Avant de partager une photo', text: 'Vérifiez qu’une photo ne révèle pas votre domicile avant de la publier ou de la mettre en vente en ligne.' },
        { title: 'Apprendre la photo', text: 'Consultez vitesse d’obturation, ouverture, ISO et objectif utilisés.' },
        { title: 'Vérifier l’origine d’une image', text: 'Voyez la date, l’appareil et le logiciel de retouche enregistrés dans le fichier. Les métadonnées se modifient facilement : ce sont des indices, pas des preuves.' },
      ],
      specs: [
        ['Formats d’entrée', 'JPG, HEIC/HEIF, PNG, WebP, AVIF, TIFF'],
        ['Métadonnées lues', 'EXIF (IFD0, EXIF, GPS, interopérabilité, vignette), XMP, IPTC, profil ICC, JFIF, en-tête PNG'],
        ['Export', 'Copie en texte, téléchargement en JSON'],
        ['Bibliothèque d’analyse', 'exifr (open source), exécutée dans votre navigateur'],
        PRIVACY,
      ],
      limits: [
        'Les données « MakerNote » propres à chaque fabricant ne sont pas décodées.',
        'Les captures d’écran et les images enregistrées depuis les réseaux sociaux ont généralement peu de métadonnées, car la plateforme les a supprimées.',
        'Le lien de carte ouvre openstreetmap.org et n’envoie que les coordonnées que vous choisissez d’afficher.',
      ],
      faq: [
        { q: 'Comment savoir si une photo contient une position GPS ?', a: 'Ouvrez-la ici. Un message bien visible en haut indique si des coordonnées GPS ont été trouvées, et lesquelles.' },
        { q: 'Qu’est-ce que l’EXIF ?', a: 'Une norme pour stocker des informations dans un fichier image : réglages de prise de vue, date et heure, orientation et parfois position. Appareils photo et téléphones l’écrivent automatiquement.' },
        { q: 'Les réseaux sociaux suppriment-ils l’EXIF ?', a: 'La plupart des grandes plateformes retirent la position des images publiques, mais elle peut subsister dans un e-mail, une messagerie envoyant la « qualité d’origine », un lien de stockage en ligne ou un site de petites annonces.' },
        { q: 'Comment supprimer les métadonnées ?', a: 'Utilisez l’outil « Supprimer les EXIF » : il retire les métadonnées sans recompresser l’image.' },
      ],
    },

    'remove-exif': {
      intro: [
        'Les coordonnées GPS enregistrées dans les métadonnées EXIF d’une photo peuvent révéler votre domicile ou votre lieu de travail. On y trouve aussi le numéro de série de l’appareil, la date et l’heure, et l’historique de retouche. Cet outil supprime ces métadonnées avant que vous ne partagiez vos photos.',
        'Contrairement aux outils qui réenregistrent l’image, il découpe uniquement la partie métadonnées du fichier. Les données d’image compressées sont copiées octet pour octet : aucune perte de qualité, le fichier devient seulement plus léger.',
      ],
      steps: [
        'Choisissez ou déposez des photos JPG, PNG ou WebP.',
        'Les métadonnées sont supprimées aussitôt ; chaque résultat indique ce qui a été retiré.',
        'Téléchargez les fichiers « …-clean » un par un ou en ZIP.',
      ],
      useCases: [
        { title: 'Petites annonces et enchères', text: 'Une photo prise chez vous peut révéler votre adresse. Supprimez-la avant de publier l’annonce.' },
        { title: 'Envoi par e-mail ou messagerie', text: 'Beaucoup de messageries et de clients e-mail envoient le fichier d’origine avec ses métadonnées. Nettoyez-le d’abord.' },
        { title: 'Publication sur votre site', text: 'Retirez infos d’appareil et historique de retouche avant l’envoi sur votre blog ou CMS.' },
      ],
      specs: [
        ['Formats d’entrée', 'JPG, PNG, WebP'],
        ['Éléments supprimés', 'EXIF (dont GPS, appareil, date), XMP, données IPTC/Photoshop, commentaires, blocs texte PNG, horodatages, données cachées après la fin de l’image'],
        ['Éléments conservables (facultatif)', 'Orientation (garde la photo dans le bon sens) et profil couleur ICC (garde des couleurs exactes)'],
        ['Qualité', 'Inchangée — aucune recompression'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Les fichiers HEIC ne sont pas pris en charge : exportez-les d’abord en JPG (le lecteur EXIF peut vous montrer ce que contient un HEIC).',
        'Les métadonnées ne sont pas le seul indice de localisation : repères, panneaux ou reflets visibles sur la photo ne sont pas supprimés.',
        'Les aperçus intégrés, cartes de profondeur et cartes de gain HDR stockés après l’image JPG principale sont aussi supprimés, ce qui peut faire disparaître certains effets propres aux téléphones (comme l’affichage HDR plus lumineux).',
      ],
      faq: [
        { q: 'Supprimer l’EXIF réduit-il la qualité ?', a: 'Non. Seule la partie métadonnées est retirée ; les données d’image compressées sont copiées telles quelles, donc l’image est identique bit à bit.' },
        { q: 'Pourquoi garder l’orientation ?', a: 'Beaucoup de téléphones enregistrent la photo de côté et utilisent cet indicateur pour l’afficher correctement. Ce n’est qu’un chiffre de 1 à 8, sans information personnelle. Désactivez l’option pour le supprimer aussi.' },
        { q: 'Comment vérifier que la position a bien été supprimée ?', a: 'Ouvrez le fichier nettoyé dans le lecteur EXIF : il affiche « Aucune position GPS trouvée ».' },
        { q: 'Mes photos sont-elles envoyées pour supprimer les données ?', a: 'Non. Le fichier est lu et réécrit dans le navigateur de votre appareil. Le principe de cet outil : protéger une photo privée ne devrait jamais nécessiter de l’envoyer quelque part.' },
      ],
    },
  },
};
