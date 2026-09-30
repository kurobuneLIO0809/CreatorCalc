import type { LocaleContent } from './types';

const PRIVACY: [string, string] = ['Dove avviene l’elaborazione', 'Nel browser del tuo dispositivo. I file non vengono mai caricati.'];
const SIZE: [string, string] = ['Limiti', 'Fino a 100 MB per file, 50 file per volta'];
const RASTER = 'JPG, PNG, WebP, AVIF, GIF (primo fotogramma), BMP';

export const it: LocaleContent = {
  tools: {
    'image-compressor': {
      name: 'Compressore di immagini',
      h1: 'Compressore di immagini',
      title: 'Comprimi immagini – Riduci JPG, PNG e WebP senza caricarli',
      description: 'Riduci il peso di file JPG, PNG e WebP nel browser. Compressione di più file, confronto prima/dopo e download immediato. Gratis, senza registrazione, i file non vengono caricati.',
      tagline: 'Alleggerisci JPG, PNG e WebP senza perdita di qualità visibile.',
      searchTerms: ['comprimere', 'ridurre', 'alleggerire', 'peso', 'dimensione', 'ottimizzare'],
    },
    'compress-image-to-kb': {
      name: 'Comprimi a KB precisi',
      h1: 'Comprimi un’immagine a una dimensione precisa (KB)',
      title: 'Comprimi un’immagine a 20 KB, 50 KB, 100 KB… – Gratis',
      description: 'Comprimi una foto sotto 20 KB, 50 KB, 100 KB, 200 KB o qualsiasi limite di caricamento. Funziona su smartphone e tutto avviene nel tuo browser.',
      tagline: 'Indica una dimensione massima e ottieni la qualità migliore che ci sta dentro.',
      searchTerms: ['kb', '100kb', '50kb', '20kb', 'dimensione massima', 'fototessera', 'domanda', 'limite caricamento'],
    },
    'image-resizer': {
      name: 'Ridimensiona immagini',
      h1: 'Ridimensiona immagini',
      title: 'Ridimensiona immagini – In pixel o percentuale, gratis',
      description: 'Ridimensiona immagini JPG, PNG, WebP e AVIF in pixel o in percentuale. Mantieni le proporzioni, elabora molte foto insieme e scaricale subito. Nessun caricamento.',
      tagline: 'Cambia larghezza e altezza di una o più immagini, in pixel o in percentuale.',
      searchTerms: ['ridimensionare', 'dimensioni', 'pixel', 'rimpicciolire', 'ingrandire', 'larghezza', 'altezza', 'risoluzione'],
    },
    'image-converter': {
      name: 'Convertitore di immagini',
      h1: 'Convertitore di immagini',
      title: 'Convertitore di immagini – WebP, PNG, JPG, AVIF, GIF, BMP online',
      description: 'Converti tra JPG, PNG e WebP e apri anche AVIF, GIF e BMP. Conversione di più file nel browser: gratis, senza registrazione, rispettoso della privacy.',
      tagline: 'Trasforma quasi qualsiasi immagine in JPG, PNG o WebP in un solo passaggio.',
      searchTerms: ['convertire', 'formato', 'estensione', 'avif', 'bmp', 'gif', 'jpeg'],
    },
    'webp-to-jpg': {
      name: 'Da WebP a JPG',
      h1: 'Converti WebP in JPG',
      title: 'Converti WebP in JPG – Gratis, più file insieme, senza caricamenti',
      description: 'Converti immagini WebP in JPG per usarle in qualsiasi app o modulo di caricamento. Conversione multipla, scelta di qualità e colore di sfondo. Funziona nel browser.',
      tagline: 'Trasforma le immagini WebP salvate dal web in normali JPG.',
      searchTerms: ['webp', 'jpeg', 'salvare', 'convertire in jpg', 'webp in png'],
    },
    'png-to-jpg': {
      name: 'Da PNG a JPG',
      h1: 'Converti PNG in JPG',
      title: 'Converti PNG in JPG – Colore di sfondo a scelta, gratis e sicuro',
      description: 'Converti PNG in JPG nel browser. Scegli il colore di sfondo delle aree trasparenti e la qualità del JPG. Conversione multipla, senza caricamenti né registrazione.',
      tagline: 'Trasforma screenshot e grafiche PNG in JPG più leggeri.',
      searchTerms: ['png', 'jpeg', 'trasparente', 'screenshot', 'alleggerire'],
    },
    'jpg-to-png': {
      name: 'Da JPG a PNG',
      h1: 'Converti JPG in PNG',
      title: 'Converti JPG in PNG – Output senza perdita, gratis, senza caricamenti',
      description: 'Converti immagini JPG in PNG nel browser, con una spiegazione di cosa cambia e cosa no (qualità, trasparenza). Conversione multipla, gratuita e privata.',
      tagline: 'Salva i JPG come PNG senza perdita, per modifiche o app che richiedono PNG.',
      searchTerms: ['jpg', 'jpeg', 'png', 'senza perdita', 'trasparente'],
    },
    'image-to-webp': {
      name: 'Da JPG e PNG a WebP',
      h1: 'Converti JPG e PNG in WebP',
      title: 'Converti JPG e PNG in WebP – Con o senza perdita, gratis',
      description: 'Converti JPG e PNG in WebP per velocizzare il tuo sito. Modalità con o senza perdita, più file insieme e un vero WebP anche quando Safari non sa crearlo. Nessun caricamento.',
      tagline: 'Crea immagini WebP più leggere per siti web e blog.',
      searchTerms: ['webp', 'jpg in webp', 'png in webp', 'sito web', 'velocità', 'ottimizzare'],
    },
    'image-to-pdf': {
      name: 'Da immagine a PDF',
      h1: 'Da immagine a PDF (JPG in PDF)',
      title: 'JPG in PDF – Più immagini in un unico PDF, gratis',
      description: 'Unisci immagini JPG, PNG, WebP e AVIF in un unico PDF. Riordina le pagine, scegli A4 o Letter e i margini. I JPG mantengono la qualità originale. Nessun caricamento.',
      tagline: 'Unisci foto e scansioni in un unico documento PDF.',
      searchTerms: ['pdf', 'jpg in pdf', 'png in pdf', 'unire', 'scansione', 'documento', 'foto in pdf'],
    },
    'image-cropper': {
      name: 'Ritaglia immagini',
      h1: 'Ritaglia un’immagine',
      title: 'Ritaglia immagini – Quadrato, 16:9, 4:5 o libero, gratis',
      description: 'Ritaglia le foto in formato quadrato, 16:9, 4:5 o in qualsiasi misura. Maniglie adatte al touch e inserimento preciso in pixel. Elaborazione nel browser, nessun caricamento.',
      tagline: 'Ritaglia un’immagine esattamente nell’area e nel formato che ti servono.',
      searchTerms: ['ritagliare', 'tagliare', 'crop', 'quadrato', 'proporzioni', 'foto profilo'],
    },
    'rotate-image': {
      name: 'Ruota immagini',
      h1: 'Ruota e capovolgi un’immagine',
      title: 'Ruota immagini – 90°, 180° o specchia, gratis',
      description: 'Ruota un’immagine di 90° o 180° oppure capovolgila in orizzontale o in verticale. Correggi insieme le foto girate di lato. Gratis, nel browser, nessun caricamento.',
      tagline: 'Correggi foto girate di lato o specchiate, una alla volta o tutte insieme.',
      searchTerms: ['ruotare', 'girare', 'rotazione', 'capovolgere', 'specchiare', 'al contrario', 'orientamento'],
    },
    'exif-viewer': {
      name: 'Visualizzatore EXIF',
      h1: 'Visualizzatore EXIF – Leggi i metadati di una foto',
      title: 'Visualizzatore EXIF – Metadati e posizione GPS di una foto',
      description: 'Mostra le informazioni nascoste in una foto: fotocamera, data di scatto, posizione GPS, obiettivo e impostazioni. JPG, HEIC, PNG e WebP. Non viene caricato nulla.',
      tagline: 'Scopri cosa nasconde una foto: fotocamera, data e posizione GPS.',
      searchTerms: ['exif', 'metadati', 'gps', 'posizione', 'fotocamera', 'data di scatto', 'info foto'],
    },
    'remove-exif': {
      name: 'Rimuovi EXIF',
      h1: 'Rimuovi EXIF e posizione dalle foto',
      title: 'Rimuovi EXIF e posizione GPS dalle foto – Senza perdita, gratis',
      description: 'Elimina posizione GPS, dati della fotocamera e altri metadati da JPG, PNG e WebP senza ricompressione. Più file insieme; le foto non lasciano mai il browser.',
      tagline: 'Rimuovi posizione e dati della fotocamera prima di condividere, senza perdere qualità.',
      searchTerms: ['exif', 'metadati', 'gps', 'posizione', 'privacy', 'rimuovere', 'geotag'],
    },
  },
  content: {
    'image-compressor': {
      intro: [
        'Le foto grandi sono lente da inviare per email, occupano spazio e spesso vengono rifiutate dai siti. Questo strumento ricodifica le immagini con la qualità scelta e, se vuoi, limita anche le dimensioni in pixel: per le foto dello smartphone è spesso ciò che fa risparmiare di più.',
        'Ogni risultato mostra la dimensione prima e dopo. Se un file è già ben ottimizzato e ricomprimerlo lo renderebbe più pesante, lo strumento ti restituisce l’originale invece di una copia più pesante e peggiore.',
      ],
      steps: [
        'Scegli o trascina uno o più file JPG, PNG, WebP o BMP. La compressione parte subito con impostazioni equilibrate.',
        'Regola qualità, formato di uscita e dimensione massima. Fino a 3 immagini i risultati si aggiornano da soli; oltre, premi «Applica impostazioni».',
        'Usa «Confronta» per verificare rispetto all’originale, poi scarica i file uno per uno o tutti insieme in ZIP.',
      ],
      useCases: [
        { title: 'Allegati email', text: 'Riduci insieme foto da 5 MB dello smartphone per farne stare una dozzina nel limite di 25 MB.' },
        { title: 'Siti più veloci', text: 'Alleggerisci immagini di copertina e foto del blog. Nei browser moderni l’uscita WebP è la più leggera.' },
        { title: 'Screenshot e grafiche', text: 'Gli screenshot PNG con ampie campiture, ridotti a una palette di 256 colori, spesso perdono il 60–80% del peso mantenendo la trasparenza.' },
      ],
      specs: [
        ['Formati in ingresso', 'JPG/JPEG, PNG, WebP, BMP'],
        ['Formati in uscita', 'Uguale all’originale, JPG, WebP, PNG'],
        ['Metodo JPG / WebP', 'Ricodifica alla qualità scelta (10–95%) con l’encoder integrato del browser; su Safari/iOS il WebP è creato da un encoder WebAssembly'],
        ['Metodo PNG', 'Riduzione a una palette di 32–256 colori (con perdita, trasparenza mantenuta) o ricodifica senza perdita'],
        ['Ridimensionamento (facoltativo)', 'Lato lungo limitato tra 800 e 3840 px; le immagini piccole non vengono ingrandite'],
        ['Metadati', 'I file ricodificati non contengono dati EXIF/GPS'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'La compressione è con perdita. A qualità molto bassa JPG e WebP mostrano blocchi o sfocature: controlla con «Confronta» prima di scaricare.',
        'GIF animate e file HEIC (iPhone) non sono supportati. Esporta prima le foto dell’iPhone in JPG.',
        'I profili colore vengono convertiti in sRGB standard. Le foto a gamma ampia (Display P3) possono apparire leggermente meno sature su schermi a gamma ampia.',
        'Le immagini molto grandi (oltre circa 16 megapixel su iPhone/iPad) vengono ridotte automaticamente per rispettare la memoria del browser, e compare un avviso.',
      ],
      faq: [
        { q: 'Le mie immagini vengono caricate su un server?', a: 'No. Vengono lette e ricodificate nel browser del tuo dispositivo (in un worker in background). La pagina non ha alcun punto di caricamento e la sua politica di sicurezza blocca l’invio di dati ad altri siti.' },
        { q: 'Che qualità devo usare?', a: 'Per le foto, 70–80% dà un risultato quasi indistinguibile dall’originale a occhio nudo, con un file molto più leggero. Per immagini con testo usa 85% o il PNG.' },
        { q: 'Perché un file è tornato invariato?', a: 'Se comprimere con le tue impostazioni producesse un file più pesante dell’originale (frequente con JPG già ottimizzati), lo strumento tiene l’originale per non darti un file più pesante e di qualità inferiore.' },
        { q: 'Il WebP è meglio del JPG?', a: 'A qualità simile, il WebP è di solito più leggero del 25–35% e tutti i browser attuali lo supportano. Ma vecchie app e molti moduli accettano solo JPG: nel dubbio, resta sul JPG.' },
        { q: 'La compressione cancella la posizione della foto?', a: 'Sì. L’immagine ricodificata è ricostruita dai soli pixel: coordinate GPS, modello della fotocamera, data e altri dati EXIF non vengono copiati. Per rimuovere i metadati senza ricomprimere usa «Rimuovi EXIF».' },
      ],
    },

    'compress-image-to-kb': {
      intro: [
        'Domande di passaporto o visto, concorsi, candidature, portali della pubblica amministrazione: molti rifiutano foto oltre 20 KB, 50 KB o 100 KB. Indovinare la qualità e riprovare è una perdita di tempo. Questo strumento trova la qualità migliore che rispetta il limite che indichi.',
        'Prova prima ad alta qualità e a grandezza reale, poi abbassa gradualmente la qualità JPG/WebP se il file è troppo pesante. Riduce le dimensioni in pixel solo se nemmeno la qualità minima basta. La dimensione finale è mostrata al byte, così puoi confrontarla con i requisiti del modulo.',
      ],
      steps: [
        'Scegli una preimpostazione (20 KB, 50 KB, 100 KB, 200 KB, 500 KB, 1 MB) o inserisci il tuo limite.',
        'Scegli o trascina le foto: JPG, PNG, WebP e altri formati sono supportati.',
        'Scarica il risultato. Vengono mostrati il numero esatto di byte e se il limite è rispettato.',
      ],
      useCases: [
        { title: 'Passaporto e visto', text: 'Molte domande online richiedono un JPG sotto 100–240 KB. Se sono richieste anche dimensioni in pixel, ritaglia prima.' },
        { title: 'Concorsi e siti di lavoro', text: 'Firme e foto possono essere limitate a 10–50 KB. Ritaglia prima i margini per dedicare la qualità a ciò che resta.' },
        { title: 'Chat e forum', text: 'Per i siti che limitano avatar o allegati a 500 KB o 1 MB, imposta il limite una volta ed elabora più immagini.' },
      ],
      specs: [
        ['Formati in ingresso', RASTER],
        ['Formati in uscita', 'JPG (predefinito) o WebP'],
        ['Metodo di adattamento', 'Ricerca binaria sulla qualità (40–92%), poi riduzione proporzionale se necessario'],
        ['Definizione di KB', '1 KB = 1.000 byte. Un risultato «100 KB» è al massimo 100.000 byte, quindi supera anche i moduli che contano 1 KB = 1.024 byte'],
        ['Limite minimo', '5 KB'],
        ['Metadati', 'Nessun dato EXIF/GPS nel file prodotto'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Con limiti molto bassi (meno di circa 20 KB) bisogna ridurre i pixel e l’immagine può risultare sfocata. Ritaglia prima lo sfondo per mantenere nitidi un volto o una firma.',
        'Se il modulo impone anche dimensioni esatte (es. 600 × 600), ridimensiona o ritaglia prima, poi comprimi al limite di peso.',
        'Il JPG non supporta la trasparenza: le aree trasparenti diventano bianche.',
        'I file HEIC (iPhone) non sono ancora supportati. In Safari su iPhone, una foto scelta dalla libreria viene di solito fornita come JPG.',
      ],
      faq: [
        { q: 'Come comprimo una foto esattamente a 100 KB?', a: 'Scegli «100 KB» e poi seleziona la foto. Ottieni la qualità migliore entro 100.000 byte. I moduli controllano solo che il limite non sia superato: non serve essere precisi, e il risultato di solito è un po’ sotto.' },
        { q: 'Cosa faccio se compare «Impossibile raggiungere la dimensione»?', a: 'Succede con limiti molto bassi e immagini molto dettagliate. Ritaglia solo la parte utile o, se il modulo lo consente, usa un limite un po’ più alto.' },
        { q: 'Perché il mio file da 100 KB risulta 97,6 KB sul computer?', a: 'A seconda del sistema, 1 KB vale 1.000 o 1.024 byte. Lo strumento rispetta il limite in entrambi i casi, quindi un file da 100.000 byte può apparire come 97,6 KB su Windows.' },
        { q: 'Funziona con le foto scattate con l’iPhone?', a: 'Di solito sì: in Safari su iPhone, una foto scelta dalla libreria viene fornita come JPG. I file HEIC copiati su un computer non sono ancora supportati: esportali in JPG o scegli «Impostazioni → Fotocamera → Formati → Più compatibile».' },
        { q: 'È sicuro per le foto di documenti o passaporto?', a: 'Le foto sono elaborate interamente sul tuo dispositivo e non vengono mai caricate su un server. Chiudendo la scheda non resta nulla.' },
      ],
    },

    'image-resizer': {
      intro: [
        'Ridimensiona immagini a dimensioni esatte in pixel, a una percentuale dell’originale o per farle stare in un riquadro come 1920 × 1080, mantenendo le proporzioni. La stessa regola vale per tutte le immagini aggiunte: prepari in un colpo le foto per un sito o un negozio online.',
        'Le forti riduzioni avvengono per passi, con ricampionamento di alta qualità, per limitare le scalettature di una riduzione unica.',
      ],
      steps: [
        'Scegli o trascina le immagini.',
        'In «Pixel» inserisci larghezza e/o altezza o scegli una preimpostazione, oppure seleziona «Percentuale». Vedrai in anteprima le nuove dimensioni della prima immagine.',
        'Premi «Ridimensiona» e scarica le immagini una per una o in ZIP.',
      ],
      useCases: [
        { title: 'Siti e negozi online', text: 'Una foto prodotto scattata con lo smartphone è spesso larga 4000 px, mentre alla maggior parte dei siti bastano 1200–2000 px, che si caricano molto più in fretta.' },
        { title: 'Social network', text: 'Preimpostazioni per post quadrati 1080 × 1080, verticali 1080 × 1350 e storie 1080 × 1920. L’immagine viene ridotta per stare nel riquadro; per una forma esatta usa il ritaglio.' },
        { title: 'Moduli con limiti in pixel', text: 'Per un requisito come «massimo 800 × 600 px», attiva «Mantieni proporzioni» e inserisci entrambi i valori: l’immagine starà dentro senza essere tagliata.' },
      ],
      specs: [
        ['Formati in ingresso', RASTER],
        ['Modalità', 'Larghezza/altezza in pixel (adatta al riquadro o allunga) o percentuale (1–400%)'],
        ['Dimensione massima in uscita', '20.000 px per lato (e limite di memoria del browser)'],
        ['Ingrandimento', 'Disattivato per impostazione predefinita («Non ingrandire immagini già più piccole»)'],
        ['Formati in uscita', 'Uguale all’originale, JPG, PNG, WebP (con «Uguale», AVIF→JPG, GIF/BMP→PNG)'],
        ['Ricampionamento', 'Dimezzamenti successivi + smussatura di alta qualità del browser'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Ingrandire un’immagine non aggiunge dettagli: un’immagine ingrandita appare sfocata.',
        'Con «Mantieni proporzioni» l’immagine viene adattata al riquadro larghezza × altezza, quindi un lato può risultare più piccolo del valore inserito. Senza l’opzione, l’immagine viene allungata. Per un formato esatto usa lo strumento di ritaglio.',
        'GIF e WebP animati vengono ridimensionati come immagini fisse (primo fotogramma).',
      ],
      faq: [
        { q: 'Come ridimensiono senza perdere qualità?', a: 'Rimpicciolire elimina per forza dei pixel, ma con un ricampionamento di alta qualità e un JPG al 90% (predefinito) l’immagine resta nitida alle nuove dimensioni. Per grafiche e screenshot scegli l’uscita PNG senza perdita.' },
        { q: 'Posso ridimensionare molte immagini insieme?', a: 'Sì: fino a 50 immagini per volta, con le stesse impostazioni per tutte, scaricabili in un unico file ZIP.' },
        { q: 'Cosa significa «Mantieni proporzioni»?', a: 'Il rapporto tra larghezza e altezza resta invariato, così persone e oggetti non vengono deformati. Se inserisci larghezza e altezza, l’immagine viene ridotta per stare in quel riquadro.' },
        { q: 'Ridimensionare riduce anche il peso del file?', a: 'Di solito molto. Dimezzando larghezza e altezza resta un quarto dei pixel, e il file perde in genere il 60–75% del peso.' },
      ],
    },

    'image-converter': {
      intro: [
        'Un convertitore unico per i formati di tutti i giorni: apri AVIF e WebP presi dal web, PNG e JPG, GIF e BMP, e salvali come JPG, PNG o WebP. Anche con file di formati diversi, tutto viene convertito con le stesse impostazioni di uscita.',
        'Le conversioni più comuni hanno una pagina dedicata con più spiegazioni: da WebP a JPG, da PNG a JPG, da JPG a PNG e da JPG/PNG a WebP.',
      ],
      steps: [
        'Scegli il formato di uscita: JPG, PNG o WebP.',
        'Scegli o trascina le immagini: la conversione parte subito.',
        'Scarica i file convertiti uno per uno o in ZIP.',
      ],
      useCases: [
        { title: 'Cartelle con formati misti', text: 'Converti insieme in JPG un misto di AVIF, WebP e PNG per un’app o una stampante che accetta solo JPG.' },
        { title: 'Mantenere la trasparenza', text: 'Con uscita PNG o WebP, gli sfondi trasparenti di PNG, WebP, GIF e AVIF vengono mantenuti.' },
        { title: 'Formati recenti', text: 'Rendi AVIF e WebP usati sul web apribili anche con programmi datati.' },
      ],
      specs: [
        ['Formati in ingresso', `${RASTER}; TIFF solo nei browser compatibili (Safari)`],
        ['Formati in uscita', 'JPG, PNG, WebP (con o senza perdita)'],
        ['Trasparenza', 'Mantenuta in PNG/WebP; riempita con il colore scelto in JPG'],
        ['Riconoscimento del formato', 'In base al contenuto del file, non all’estensione'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'GIF/WebP/PNG animati vengono convertiti in una sola immagine fissa.',
        'I file HEIC (iPhone) non sono ancora supportati e l’uscita AVIF non è disponibile (i browser non sanno ancora codificarla).',
        'SVG, PDF, RAW e PSD non sono supportati.',
      ],
      faq: [
        { q: 'Quale formato scelgo?', a: 'JPG per foto che devono aprirsi ovunque; PNG per screenshot, loghi e immagini trasparenti; WebP per il peso minimo su un sito web.' },
        { q: 'Perché un file .jpg è stato rifiutato?', a: 'Lo strumento controlla il contenuto reale di ogni file. Rinominare un PDF o una pagina web in .jpg non lo trasforma in un’immagine: per sicurezza questi file vengono rifiutati.' },
        { q: 'Posso convertire immagini AVIF?', a: 'Sì, se il browser sa mostrare l’AVIF (Chrome, Edge, Firefox recenti e Safari 16 o successivo).' },
      ],
    },

    'webp-to-jpg': {
      intro: [
        'Molti siti servono le immagini in WebP: «Salva immagine con nome» produce quindi un file .webp che vecchie app, alcuni programmi di fotoritocco e molti moduli di caricamento rifiutano. Questo strumento converte il WebP in un normale JPG (o PNG).',
        'Un WebP può avere aree trasparenti, che il JPG non supporta. Puoi scegliere il colore con cui riempirle (bianco per impostazione predefinita).',
      ],
      steps: [
        'Scegli o trascina uno o più file .webp.',
        'Vengono convertiti subito in JPG con qualità 90%. Cambia qualità o colore di sfondo se serve.',
        'Scarica i JPG uno per uno o tutti insieme in ZIP.',
      ],
      useCases: [
        { title: 'Immagini salvate dal web', text: 'Rendi le immagini scaricate utilizzabili in Word, in vecchi programmi di fotoritocco o nei servizi di stampa.' },
        { title: 'Moduli di caricamento', text: 'Converti il WebP in JPG per i siti che accettano solo JPG o PNG.' },
        { title: 'WebP trasparenti in PNG', text: 'Per mantenere lo sfondo trasparente scegli l’uscita PNG invece di JPG.' },
      ],
      specs: [
        ['Formato in ingresso', 'WebP (con perdita, senza perdita, trasparente; animato: primo fotogramma)'],
        ['Formati in uscita', 'JPG (predefinito) o PNG'],
        ['Trasparenza', 'Riempita di bianco, nero o colore a scelta in JPG; mantenuta in PNG'],
        ['Qualità', '30–100% (predefinita 90%)'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'I WebP animati vengono convertiti in una sola immagine fissa (il primo fotogramma).',
        'Poiché il WebP comprime meglio, il JPG ottenuto può pesare più del WebP originale.',
      ],
      faq: [
        { q: 'Perché i siti usano il WebP?', a: 'A qualità simile un WebP pesa di solito il 25–35% in meno di un JPG, e le pagine si caricano più in fretta. Tutti i browser moderni lo supportano, ma alcuni programmi desktop no.' },
        { q: 'Convertire WebP in JPG riduce la qualità?', a: 'Il JPG è con perdita, quindi leggermente, ma al 90% la differenza è invisibile su un’immagine normale. Per evitare qualsiasi perdita scegli l’uscita PNG.' },
        { q: 'Posso convertire WebP in PNG qui?', a: 'Sì: scegli PNG in «Converti in». La trasparenza viene mantenuta.' },
        { q: 'Si può convertire un WebP senza un sito web?', a: 'Sì. Su Windows aprilo in Paint e usa «Salva con nome → JPEG»; su Mac, in Anteprima, File → Esporta → JPEG. Questo strumento è più comodo per convertire molti file insieme o scegliere il colore delle aree trasparenti.' },
        { q: 'Perché «Salva immagine» mi dà un WebP?', a: 'Il sito invia WebP ai browser che lo supportano e il browser salva il formato ricevuto. Nessuna impostazione del browser lo cambia: convertire il file salvato è la soluzione pratica.' },
      ],
    },

    'png-to-jpg': {
      intro: [
        'Il PNG è senza perdita, quindi foto e screenshot di foto risultano pesanti. In JPG spesso pesano una frazione, e il JPG è proprio il formato richiesto da molti moduli di caricamento.',
        'Il JPG non supporta la trasparenza: i pixel trasparenti vengono riempiti con il colore che scegli. Bianco per impostazione predefinita, ma per un logo destinato a uno sfondo scuro puoi scegliere nero o qualsiasi colore.',
      ],
      steps: [
        'Scegli o trascina i file PNG.',
        'Scegli il colore di sfondo delle aree trasparenti e la qualità del JPG.',
        'Scarica i JPG uno per uno o tutti insieme in ZIP.',
      ],
      useCases: [
        { title: 'Screenshot di foto', text: 'Uno screenshot PNG di una foto o di un video in JPG pesa spesso da 3 a 10 volte meno.' },
        { title: 'Moduli che richiedono JPG', text: 'Converti scansioni ed esportazioni da strumenti di grafica in JPG per una domanda online.' },
        { title: 'Loghi su sfondo colorato', text: 'Imposta il colore di sfondo in base a dove verrà inserita l’immagine.' },
      ],
      specs: [
        ['Formato in ingresso', 'PNG (anche trasparente e a 16 bit; APNG: primo fotogramma)'],
        ['Formato in uscita', 'JPG'],
        ['Trasparenza', 'Riempita con il colore scelto (bianco predefinito)'],
        ['Qualità', '30–100% (predefinita 90%)'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Testo e linee sottili possono sbavare leggermente in JPG. Per screenshot di testo, la riduzione della palette PNG del «Compressore di immagini» dà spesso un risultato più pulito.',
        'Il JPG non mantiene la trasparenza. Per un file leggero e trasparente usa il WebP.',
      ],
      faq: [
        { q: 'Perché il JPG pesa meno del PNG?', a: 'Il JPG scarta dettagli poco visibili nelle foto, mentre il PNG salva ogni pixel esattamente. Per una foto il risparmio è di solito del 70–90%.' },
        { q: 'Cosa succede allo sfondo trasparente?', a: 'Viene sostituito dal colore di sfondo scelto. Per mantenere la trasparenza converti in WebP o resta sul PNG.' },
        { q: 'Si può convertire PNG in JPG senza perdere qualità?', a: 'Al 95–100% una foto sembra identica, ma il risparmio di peso è ridotto. 85–90% è un buon compromesso.' },
      ],
    },

    'jpg-to-png': {
      intro: [
        'Il PNG è senza perdita: una volta in PNG, modifiche e salvataggi successivi non aggiungono nuovi difetti di compressione. Alcune app, servizi di stampa e strumenti di grafica richiedono inoltre il PNG.',
        'Due equivoci comuni: convertire un JPG in PNG non recupera i dettagli già persi con la compressione JPG e non rende trasparente lo sfondo. Il PNG ha esattamente lo stesso aspetto del JPG, con un peso di varie volte superiore.',
      ],
      steps: [
        'Scegli o trascina i file JPG.',
        'Ogni immagine viene convertita subito in PNG.',
        'Scarica i PNG uno per uno o in ZIP.',
      ],
      useCases: [
        { title: 'Modificare senza degradare', text: 'Passa al PNG prima di modificare e salvare più volte: la qualità non calerà a ogni salvataggio.' },
        { title: 'App che richiedono PNG', text: 'Alcuni strumenti per icone, sticker o grafica accettano solo PNG.' },
        { title: 'Prima di scontornare', text: 'Il PNG supporta la trasparenza: è un buon formato di lavoro se poi rimuoverai lo sfondo in un programma di fotoritocco.' },
      ],
      specs: [
        ['Formato in ingresso', 'JPG / JPEG (orientamento EXIF applicato)'],
        ['Formato in uscita', 'PNG (senza perdita, 8 bit per canale)'],
        ['Variazione di peso tipica', 'Da 3 a 8 volte il JPG per una foto'],
        ['Metadati', 'Nessun dato EXIF/GPS nel file prodotto'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'La qualità non migliora: i difetti del JPG restano visibili nel PNG.',
        'Lo sfondo resta opaco. Per renderlo trasparente serve uno strumento di rimozione dello sfondo.',
        'I JPG CMYK vengono convertiti in RGB.',
      ],
      faq: [
        { q: 'Convertire JPG in PNG migliora la qualità?', a: 'No. Il PNG conserva l’immagine così com’è, difetti di compressione inclusi. Evita solo il degrado nei salvataggi futuri.' },
        { q: 'Lo sfondo del JPG diventerà trasparente?', a: 'No. Il JPG non contiene informazioni di trasparenza, quindi il PNG è completamente opaco. Lo sfondo va rimosso con un programma di fotoritocco.' },
        { q: 'Perché il PNG pesa così tanto?', a: 'Salva ogni pixel senza perdita. Le foto hanno moltissime variazioni sottili, che la compressione senza perdita non riesce a ridurre molto.' },
      ],
    },

    'image-to-webp': {
      intro: [
        'A qualità simile un WebP pesa di solito il 25–35% in meno di un JPG, e il WebP senza perdita batte spesso il PNG. È un modo semplice per velocizzare un sito o un blog.',
        'Safari (e tutti i browser su iPhone e iPad) non sa codificare il WebP e restituisce in silenzio un PNG. Questo strumento se ne accorge e passa a un encoder WebP in WebAssembly integrato: ottieni sempre un vero file .webp.',
      ],
      steps: [
        'Scegli o trascina file JPG, PNG, BMP o GIF.',
        'Vengono convertiti in WebP con qualità 80%. Per loghi, icone e screenshot attiva «WebP senza perdita».',
        'Confronta i pesi, poi scarica uno per uno o in ZIP.',
      ],
      useCases: [
        { title: 'Velocità del sito', text: 'Sostituire JPG/PNG con WebP alleggerisce le pagine e migliora indicatori come il Largest Contentful Paint.' },
        { title: 'Grafiche trasparenti', text: 'Un logo PNG trasparente convertito in WebP mantiene la trasparenza, con o senza perdita.' },
        { title: 'Blog e CMS', text: 'La maggior parte dei CMS moderni accetta il WebP. Convertire prima del caricamento fa risparmiare spazio e banda.' },
      ],
      specs: [
        ['Formati in ingresso', 'JPG, PNG, BMP, GIF (primo fotogramma)'],
        ['Formato in uscita', 'WebP — con perdita (qualità 30–100%) o senza perdita'],
        ['Encoder', 'Quello del browser se disponibile; libwebp (WebAssembly) su Safari/iOS e in modalità senza perdita'],
        ['Trasparenza', 'Mantenuta'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'Una GIF animata diventa un WebP fisso (primo fotogramma).',
        'Un JPG già molto compresso, ricodificato ad alta qualità, può dare un WebP più pesante. Abbassa la qualità o tieni il JPG.',
        'Alcuni vecchi programmi e client email non aprono il WebP: conserva gli originali.',
      ],
      faq: [
        { q: 'WebP con o senza perdita?', a: 'Con perdita per le foto (molto più leggero). Senza perdita per screenshot, loghi, icone e illustrazioni con campiture e contorni netti.' },
        { q: 'Tutti i browser mostrano il WebP?', a: 'Sì: Chrome, Edge, Firefox e Safari recenti mostrano tutti il WebP. Solo browser molto vecchi come Internet Explorer non lo supportano.' },
        { q: 'Si ottiene un vero WebP su Safari o iPhone?', a: 'Sì, è pensato per questo. Safari non sa codificare il WebP e restituisce un PNG; lo strumento controlla quindi ogni risultato e, se non è WebP, lo codifica sul tuo dispositivo con la versione WebAssembly di libwebp di Google.' },
      ],
    },

    'image-to-pdf': {
      intro: [
        'Unisci foto, scansioni e screenshot in un unico PDF: comodo per inviare documenti, ricevute o archiviare appunti. Ordina le pagine come vuoi e scegli formato della carta e margini.',
        'Le foto JPG vengono inserite così come sono, senza ricompressione: nessuna perdita di qualità. I PNG vengono inseriti senza perdita. Gli altri formati (WebP, AVIF) vengono prima convertiti in JPG di alta qualità.',
      ],
      steps: [
        'Scegli o trascina le immagini; potrai aggiungerne altre in seguito.',
        'Riordina le pagine con i pulsanti ↑ ↓ ed elimina quelle che non servono.',
        'Scegli A4, US Letter o «Uguale all’immagine», l’orientamento e i margini, poi premi «Crea PDF» e scaricalo.',
      ],
      useCases: [
        { title: 'Inviare documenti', text: 'Unisci in un solo PDF le foto di documenti d’identità, certificati o moduli scattate con lo smartphone.' },
        { title: 'Ricevute e note spese', text: 'Raccogli le foto delle ricevute di un mese in un unico PDF per la nota spese.' },
        { title: 'Appunti e lavagne', text: 'Trasforma foto di appunti a mano o di una lavagna in un unico documento facile da condividere.' },
      ],
      specs: [
        ['Formati in ingresso', RASTER],
        ['Formato pagina', 'A4, US Letter o uguale a ogni immagine (96 px/pollice)'],
        ['Orientamento', 'Automatico per ogni immagine, o fisso verticale/orizzontale'],
        ['Margini', 'Nessuno, piccolo (0,25 pollici), grande (0,5 pollici)'],
        ['Qualità', 'JPG inseriti senza ricompressione; PNG senza perdita; altri formati convertiti in JPG al 92%'],
        ['Limiti', '50 immagini per PDF, 100 MB per immagine'],
        PRIVACY,
      ],
      limits: [
        'Il PDF contiene solo immagini, senza testo ricercabile (nessun OCR).',
        'Foto grandi danno un PDF pesante. Per alleggerirlo, riduci prima le immagini con «Comprimi a KB precisi» o «Ridimensiona immagini».',
        'I JPG con un orientamento EXIF vengono ricodificati ad alta qualità per essere mostrati nel verso giusto.',
        'I file HEIC (iPhone) non sono ancora supportati.',
      ],
      faq: [
        { q: 'Come unisco più JPG in un solo PDF?', a: 'Seleziona tutti i JPG (puoi anche aggiungerli in più volte), mettili in ordine e premi «Crea PDF». Ogni immagine diventa una pagina.' },
        { q: 'La qualità delle immagini peggiora?', a: 'No per i JPG, inseriti byte per byte, né per i PNG, inseriti senza perdita. Gli altri formati vengono convertiti in JPG al 92%.' },
        { q: 'Posso creare un PDF dallo smartphone?', a: 'Sì. Lo strumento funziona nei browser mobili e puoi scegliere le immagini direttamente dalla galleria.' },
        { q: 'C’è un limite di pagine?', a: 'Fino a 50 immagini per PDF. Le foto grandi usano molta memoria, soprattutto sugli smartphone.' },
      ],
    },

    'image-cropper': {
      intro: [
        'Ritaglia esattamente la parte della foto che ti serve: trascina il riquadro o le sue maniglie (anche con il touch), scegli un formato fisso (1:1 per la foto profilo, 16:9 per una miniatura) o inserisci posizione e dimensioni al pixel.',
        'Il ritaglio si applica all’immagine a piena risoluzione, non all’anteprima ridotta mostrata sullo schermo.',
      ],
      steps: [
        'Scegli o trascina un’immagine.',
        'Scegli un formato (o libero), trascina il riquadro o i suoi angoli, oppure inserisci X, Y, larghezza e altezza.',
        'Premi «Ritaglia», poi scarica o copia il risultato.',
      ],
      useCases: [
        { title: 'Foto profilo', text: 'Un quadrato centrato 1:1 per social network, app di messaggistica o fototessere.' },
        { title: 'Post e miniature', text: '4:5 per i post verticali, 9:16 per le storie, 16:9 per miniature video e presentazioni.' },
        { title: 'Togliere il superfluo', text: 'Taglia i bordi, un passante sullo sfondo o la parte di uno screenshot che non vuoi condividere.' },
      ],
      specs: [
        ['Formati in ingresso', RASTER],
        ['Formati predefiniti', 'Libero, originale, 1:1, 4:3, 3:2, 16:9, 9:16, 4:5'],
        ['Precisione', '1 pixel dell’immagine originale'],
        ['Uscita', 'Stesso formato dell’originale (AVIF→JPG), o JPG/PNG/WebP'],
        ['Tastiera', 'Frecce per spostare il riquadro, Maiusc + frecce per ridimensionarlo'],
        PRIVACY,
      ],
      limits: [
        'Un’immagine alla volta.',
        'JPG e WebP vengono salvati con qualità 92%. Per evitare ogni perdita scegli PNG.',
      ],
      faq: [
        { q: 'Come ritaglio una foto in formato quadrato?', a: 'Scegli il formato 1:1. Al centro compare un quadrato: spostalo, regola la dimensione dagli angoli e premi «Ritaglia».' },
        { q: 'Il ritaglio riduce la qualità?', a: 'Il ritaglio usa i pixel originali così come sono. JPG/WebP vengono salvati al 92%, senza differenze visibili. Per un risultato del tutto senza perdita scegli PNG.' },
        { q: 'Posso ritagliare al pixel?', a: 'Sì: inserisci i valori nei campi X, Y, larghezza e altezza. Per cambiare anche le dimensioni finali usa poi «Ridimensiona immagini».' },
      ],
    },

    'rotate-image': {
      intro: [
        'Ruota le foto di 90° o 180° o capovolgile in orizzontale o in verticale: foto dello smartphone girate di lato, documenti scansionati al contrario, selfie specchiati. La stessa modifica si applica a tutte le immagini aggiunte, così correggi una serie di scansioni in un colpo.',
        'Prima di applicare vedi il risultato in anteprima sulla prima immagine.',
      ],
      steps: [
        'Scegli o trascina una o più immagini.',
        'Premi i pulsanti di rotazione e capovolgimento finché l’anteprima è corretta.',
        'Premi «Ruota» e scarica una per una o in ZIP.',
      ],
      useCases: [
        { title: 'Foto dello smartphone girate', text: 'Correggi le foto che appaiono di lato in alcune app o siti.' },
        { title: 'Documenti scansionati', text: 'Ruota insieme le pagine scansionate al contrario.' },
        { title: 'Selfie specchiati', text: 'Capovolgi in orizzontale una foto della fotocamera frontale per leggere correttamente il testo.' },
      ],
      specs: [
        ['Formati in ingresso', RASTER],
        ['Operazioni', 'Rotazione di 90° a sinistra/destra, 180°, capovolgimento orizzontale, verticale (combinabili)'],
        ['Uscita', 'Stesso formato dell’originale (AVIF→JPG, GIF/BMP→PNG); JPG/WebP salvati al 92%'],
        ['Orientamento EXIF', 'Applicato prima: la rotazione parte dall’immagine come la vedi di solito'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'I JPG vengono ricodificati con qualità 92%, quindi la rotazione non è strettamente senza perdita.',
        'Tutte le immagini di un gruppo ricevono la stessa rotazione.',
      ],
      faq: [
        { q: 'Perché la foto è dritta sul telefono ma di lato su alcuni siti?', a: 'Spesso i telefoni salvano la foto senza ruotarla e aggiungono un piccolo indicatore di «orientamento»; le app che lo ignorano la mostrano di lato. Ruotandola qui, i pixel vengono scritti nel verso giusto e la foto appare corretta ovunque.' },
        { q: 'Che differenza c’è tra ruotare e capovolgere?', a: 'Ruotare gira l’immagine attorno al centro. Capovolgere la specchia: in orizzontale scambia sinistra e destra, in verticale alto e basso.' },
        { q: 'Posso ruotare più immagini insieme?', a: 'Sì, fino a 50. A tutte vengono applicati la stessa rotazione e lo stesso capovolgimento.' },
      ],
    },

    'exif-viewer': {
      intro: [
        'Le foto di smartphone e fotocamere contengono informazioni nascoste: fotocamera e obiettivo, data e ora esatte, impostazioni di esposizione, software usato e spesso le coordinate GPS del luogo di scatto. Questo visualizzatore le mostra tutte e ti avvisa chiaramente se è presente una posizione.',
        'Il file viene letto nel browser; non viene caricato nulla. È fondamentale, perché spesso si vogliono controllare proprio le foto personali.',
      ],
      steps: [
        'Scegli o trascina una foto (JPG, HEIC, PNG, WebP, AVIF, TIFF).',
        'Guarda il riepilogo e il controllo GPS in alto, poi apri i gruppi sotto per vedere tutti i campi.',
        'Copia i metadati come testo, scaricali in JSON o eliminali con «Rimuovi EXIF».',
      ],
      useCases: [
        { title: 'Prima di condividere una foto', text: 'Controlla che una foto non riveli casa tua prima di pubblicarla o metterla in vendita online.' },
        { title: 'Imparare la fotografia', text: 'Scopri tempo di scatto, diaframma, ISO e obiettivo usati.' },
        { title: 'Verificare l’origine di un’immagine', text: 'Vedi data, dispositivo e software di modifica registrati nel file. I metadati si possono modificare: sono indizi, non prove.' },
      ],
      specs: [
        ['Formati in ingresso', 'JPG, HEIC/HEIF, PNG, WebP, AVIF, TIFF'],
        ['Metadati letti', 'EXIF (IFD0, EXIF, GPS, interoperabilità, miniatura), XMP, IPTC, profilo ICC, JFIF, intestazione PNG'],
        ['Esportazione', 'Copia come testo, download in JSON'],
        ['Libreria di analisi', 'exifr (open source), eseguita nel browser'],
        PRIVACY,
      ],
      limits: [
        'I dati «MakerNote» specifici di ogni produttore non vengono decodificati.',
        'Screenshot e immagini salvate dai social di solito hanno pochi metadati, perché la piattaforma li ha già rimossi.',
        'Il link alla mappa apre openstreetmap.org e invia solo le coordinate che scegli di visualizzare.',
      ],
      faq: [
        { q: 'Come controllo se una foto contiene la posizione GPS?', a: 'Aprila qui. Un messaggio ben visibile in alto indica se sono state trovate coordinate GPS e quali.' },
        { q: 'Che cos’è l’EXIF?', a: 'Uno standard per memorizzare informazioni in un file immagine: impostazioni di scatto, data e ora, orientamento e talvolta posizione. Fotocamere e smartphone lo scrivono automaticamente.' },
        { q: 'I social rimuovono l’EXIF?', a: 'La maggior parte delle grandi piattaforme rimuove la posizione dalle immagini pubbliche, ma può restare in email, app di messaggistica che inviano la «qualità originale», link di cloud e siti di annunci.' },
        { q: 'Come rimuovo i metadati?', a: 'Usa lo strumento «Rimuovi EXIF»: elimina i metadati senza ricomprimere l’immagine.' },
      ],
    },

    'remove-exif': {
      intro: [
        'Le coordinate GPS salvate nei metadati EXIF di una foto possono rivelare dove abiti o lavori. Ci sono anche il numero di serie della fotocamera, data e ora e la cronologia delle modifiche. Questo strumento elimina quei metadati prima che tu condivida le foto.',
        'A differenza degli strumenti che salvano di nuovo l’immagine, taglia direttamente dal file solo la parte dei metadati. I dati dell’immagine compressa vengono copiati byte per byte: zero perdita di qualità, il file diventa solo più leggero.',
      ],
      steps: [
        'Scegli o trascina foto JPG, PNG o WebP.',
        'I metadati vengono rimossi subito; ogni risultato elenca cosa è stato eliminato.',
        'Scarica i file «…-clean» uno per uno o in ZIP.',
      ],
      useCases: [
        { title: 'Annunci e aste online', text: 'Una foto scattata in casa può rivelare il tuo indirizzo. Rimuovila prima di pubblicare l’annuncio.' },
        { title: 'Invio per email o chat', text: 'Molte app di messaggistica e client email inviano il file originale con i metadati. Puliscilo prima.' },
        { title: 'Pubblicazione sul tuo sito', text: 'Rimuovi dati della fotocamera e cronologia delle modifiche prima di caricare su blog o CMS.' },
      ],
      specs: [
        ['Formati in ingresso', 'JPG, PNG, WebP'],
        ['Cosa viene rimosso', 'EXIF (inclusi GPS, fotocamera, data), XMP, dati IPTC/Photoshop, commenti, blocchi di testo PNG, marcature temporali, dati nascosti dopo la fine dell’immagine'],
        ['Cosa si può mantenere (facoltativo)', 'Orientamento (mantiene la foto nel verso giusto) e profilo colore ICC (mantiene i colori corretti)'],
        ['Qualità', 'Invariata — nessuna ricompressione'],
        PRIVACY,
        SIZE,
      ],
      limits: [
        'I file HEIC non sono supportati: esportali prima in JPG (il visualizzatore EXIF può mostrarti cosa contiene un HEIC).',
        'I metadati non sono l’unico indizio di posizione: punti di riferimento, insegne o riflessi visibili nella foto non vengono rimossi.',
        'Vengono rimosse anche anteprime incorporate, mappe di profondità e mappe di guadagno HDR salvate dopo l’immagine JPG principale, quindi alcuni effetti tipici degli smartphone (come la luminosità HDR potenziata) possono sparire.',
      ],
      faq: [
        { q: 'Rimuovere l’EXIF riduce la qualità?', a: 'No. Viene tolta solo la parte dei metadati; i dati dell’immagine compressa sono copiati così come sono, quindi l’immagine è identica bit per bit.' },
        { q: 'Perché mantenere l’orientamento?', a: 'Molti smartphone salvano la foto di lato e usano questo indicatore per mostrarla correttamente. È solo un numero da 1 a 8, senza dati personali. Disattiva l’opzione per rimuovere anche questo.' },
        { q: 'Come verifico che la posizione sia stata davvero rimossa?', a: 'Apri il file pulito nel visualizzatore EXIF: mostrerà «Nessuna posizione GPS trovata».' },
        { q: 'Le foto vengono caricate per eliminare i dati?', a: 'No. Il file viene letto e riscritto nel browser del tuo dispositivo. Il principio di questo strumento: proteggere una foto privata non dovrebbe mai richiedere di caricarla da qualche parte.' },
      ],
    },
  },
};
