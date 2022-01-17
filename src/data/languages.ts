export type Language = {
	locale: string;
	name: string;
	en: string;
	rtl: boolean;
};

function l(locale, name, en, rtl = false) {
	return { locale, name, en, rtl };
}

export const interfaceLanguages: Language[] = [
	l('en', 'English', 'English'),
	l('fr', 'Français', 'French'),
	l('zh-CN', '中文（简体）', 'Chinese - Mandarin (Simplified)'),
	l('zh-TW', '中文（繁體）', 'Chinese - Mandarin (Traditional)'),
	l('ru', 'Русский', 'Russian'),
	l('es', 'Español', 'Spanish'),
	l('he', 'עברית', 'Hebrew', true)
];

export function isRTL(locale: string): boolean {
	return interfaceLanguages.find((l) => l.locale === locale)?.rtl ?? false;
}

type TargetLanguage = {
	en: string;
	code: string;
	name: string;
	speakers: number;
};

export const targetLanguages: TargetLanguage[] = `English	en	English	1348
Japanese	ja	日本語	126
Russian	ru	Русский	258
Chinese\xA0(Simplified)	zh-CN	中文 (简体)	1120
Chinese\xA0(Traditional)	zh-TW	中文 (繁體)	1120
Czech	cs	Čeština	10.7
French	fr	Français	267
German	de	Deutsch	135
Portuguese	pt	Português	258
Arabic	ar	العَرَبِيَّة	274
Dutch	nl	Nederlands	25
Persian	fa	فارسی	74
Polish	pl	Polski	41
Spanish	es	Español	543
Armenian	hy	Հայերէն	5
Swedish	sv	Svenska	10
Georgian	ka	ქართული	3.7
Italian	it	Italiano	68
Korean	ko	한국어	82
Romanian	ro	Română	23.6
Bulgarian	bg	Български	8
Greek	el	Ελληνικά	13.5
Ukrainian	ukr	Українська	45
Serbo-Croatian	sr	Српски	21
Latvian	lv	Latviešu	1.75
Danish	da	Dansk	6
Slovenian	sl	Slovenski	2.5
Thai	th	ภาษาไทย	61
Hebrew	he	עברית	7
Hindi	hi	हिन्दी	600
Slovak	sk	Slovenčina	5.2
Belarusian	be	Беларуская	11.4
Vietnamese	vi	Tiếng Việt	77
Lithuanian	lt	Lietuvių	3
Macedonian	mk	Македонски	3.5
Catalan	ca	Català	4.1
Finnish	fi	Suomi	5.8
Turkish	tr	Türkçe	88
Hungarian	hu	Magyar	13
Icelandic	is	Íslenska	0.314
Estonian	et	Eesti	1.1
Burmese	my	မြန်မာစာ	43
Central Khmer	km	ភាសាខ្មែរ	16
Esperanto	eo	Esperanto	0.1
Irish	ga	Gaeilge	0.17
Albanian	sq	Shqip	7.5
Malay	ms	Bahasa Melayu	200
Lao	lo	ພາສາລາວ	30
Kazakh	kk	Қазақша	13.2
Azerbaijani	az	Azərbaycanca	30
Urdu	ur	اُردُو	230
Yiddish	yi	ייִדיש	1.5
Tajik	tg	Тоҷикӣ	8.1
Indonesian	id	Bahasa Indonesia	199
Latin	la	Lingua latīna	
Mongolian	mn	Монгол хэл	5.2
Welsh	cy	Cymraeg	1
Asturian	ast	Asturianu	0.641
Galician	gl	Galego	2.4
Uzbek	uz	Oʻzbekcha	34
Kyrgyz	ky	Кыргызча	4.5
Bengali	bn	বাংলা	268
Turkmen	tk	Türkmençe	11
Scottish Gaelic	gd	Gàidhlig	0.057
Faroese	fo	Føroyskt	0.072
Tagalog	tl	Wikang	23.8
Telugu	te	తెలుగు	96
Swahili	sw	Kiswahili	69
Afrikaans	af	Afrikaans	10.3
Ido	io	Ido	0.001
Maltese	mt	Malti	0.52
Maori	mi	Te Reo	0.05
Kurdish	ku	Kurdî	20
Basque	eu	Euskara	0.75
Tatar	tt	Татарча	5.2
Bashkir	ba	Башҡортса	1.4
Uyghur	ug	ئۇيغۇرچە	10
Cantonese	yue	粵語	85
Tamil	ta	தமிழ்	85.5
Occitan	oci	Occitan	0.1
Luxembourgish	lb	Lëtzebuergesch	0.6
Navajo	nv	Diné bizaad	0.17
Tibetan	bo	བོད་སྐད་	1.2
Pashto	ps	پښتو	40
Volapük	vo	Volapük	
Romansh	rm	Rumantsch	0.04
Friulian	fur	Furlan	0.6
Sinhala	si	සිංහල	17
Breton	br	Brezhoneg	0.21
Western Frisian	fy	Frysk	0.47
Lower Sorbian	dsb	Dolnoserbski	0.069
Sicilian	scn	Sicilianu	4.7
Ancient Greek	grc	Ἑλληνική	
Malayalam	ml	മലയാളം	35
Assamese	ast	Asturianu	23.5
Quechua	qu	Runa simi	6.9
Interlingua	ia	Interlingua	
Marathi	mr	मराठी	99
Walloon	wa	Walon	0.6
Venetian	vec	Łéngua vèneta	3.9
Sanskrit	sa	संस्कृतम्	
Gujarati	gu	ગુજરાતી	62
Kannada	kn	ಕನ್ನಡ	59
Norwegian Nynorsk	nn	Norsk nynorsk	5.32
Norwegian Bokmål	nb	Norsk bokmål	5.32
Aromanian	rup	Armãneashce	0.25
Sardinian	srd	Sardu	1
Egyptian Arabic	arz	مَصرى	70
Amharic	am	አማርኛ	57
Old English	ang	Ænglisc	
Latgalian	ltg	Latgalīšu volūda	0.15
Hawaiian	haw	ʻŌlelo Hawaiʻi	0.024
Min Nan Chinese	nan	閩南語	48
Manx	gv	Gaelg	0.001
Upper Sorbian	hsb	Hornjoserbšćina	0.013
Punjabi	pa	ਪੰਜਾਬੀ	65
Crimean Tatar	crh	Къырымтатарджа	0.54
Cornish	kw	Kernowek	0.0005
Chechen	ce	Нохчийн мотт	2
Greenlandic	kl	Kalaallisut	0.056
Cherokee	chr	ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ	0.015
Ossetian	os	Ирон ӕвзаг	0.597
Zaza	zza	Zazakî	1.334
Zulu	zu	IsiZulu	12
Haitian Creole	ht	Kreyòl ayisyen	9.6
Chuvash	cv	Чӑвашла	1.043
Nepali	ne	नेपाली भाषा	16
Old Church Slavonic	cu	Славе́нскїй ѧ҆зы́къ	
Dalmatian	dlm	Langa dalmata	
Northern Sami	se	Davvisámegiella	0.025
Kalmyk	xal	Хальмг келн	0.08
Scots	sco	Braid Scots	0.099
Odia	or	ଓଡ଼ିଆ	35
Abkhaz	ab	Аҧсуа бызшәа	0.19
Zhuang	za	Vahcuengh	16
Tuvan	tyv	Тыва дыл	0.28
Hausa	ha	Harshen Hausa	75
Javanese	jv	ꦧꦱꦗꦮ	68
Aragonese	an	Aragonés	0.01
Hakka Chinese	hak	客家話	44
Sundanese	su	Basa Sunda	42
Chamicuro	ccc	Chamicuro	
Nahuatl	nah	Nahuatl	1.7
Ngazidja Comorian	zdj	Shikomori	1
Malagasy	mg	Malagasy	25
Moroccan Arabic	ary	الدارجة	30
Somali	so	Af Soomaali	21.8
Southern Altai	alt	Алтай тили	0.055
Adyghe	ady	Адыгабзэ	0.3
Udmurt	udm	Удмурт кыл	0.554
Chichewa	ny	Chichewa	12
Guarani	gn	Avañe'ẽ	6.5
Gothic	got	Gothic	
Interlingue; Occidental	ie	Interlingue	
Wolof	wo	Wolof	5.454
Tok Pisin	tpi	Tok Pisin	0.12
Avaric	av	Магӏарул мацӏ	1
Tigrinya	ti	ትግርኛ	9.85
Rusyn	rue	Русинськый язык	0.623
Northern Frisian	frr	Frasch	0.01
Mirandese	mwl	Mirandés	0.015
Min Dong Chinese	cdo	閩東語	9.5
Southern Sotho	sot	Sesotho	5.6
Cebuano	ceb	Sinugbuanong Binisayâ	27.5
Dungan	dng	Хуэйзў йүян	0.11
Taos (Northern Tiwa)	twf	Taos	0.0008
Swiss German	gsw	Schwiizerdütsch	4.93
Istriot	ist	Bumbaro	0.0004
Central Kurdish	ckb	Sorani Kurdish	8
Buriat	bua	Буряад хэлэн	0.256
Ewe	ewe	Èʋegbe	7
Hijazi Arabic	acw	حجازي	14.5
Balochi	bal	بلوچی	6.3
Novial	nov	Novial	
Old Norse	non	Dǫnsk tunga	
Aramaic	arc	ܐܪܡܝܐ	
Karachay-Balkar	krc	Къарачай-Малкъар	0.31
Limburgan	li	Lèmburgs	1.3
Ladin	lld	Lingaz ladin	0.041
Sylheti	syl	Silôṭi	10
Wymysorys	wym	Wymysiöeryś	0.00002
Maldivian	dv	ދިވެހި; ދިވެހިބަސް	0.34
Kumyk	kum	Къумукъ тил	0.45
Kashubian	csb	Kaszëbsczi jãzëk	0.108
Hokkaido Ainu	ain	アイヌ・イタㇰ	0.000002
Corsican	co	Corsu	0.15
Wu Chinese	wuu	吳語	82
Ottoman Turkish	ota	لسان عثمانى	
Central Melanau	mel	Melanau	0.11
Yoruba	yo	Èdè Yorùbá	43
Coptic	cop	Ϯⲙⲉⲑⲣⲉⲙⲛ̀ⲭⲏⲙⲓ	
Waray	war	Waray	3.6
Shor	cjs	Шор тили	0.028
Old Russian	orv	Словеньскыи ꙗзыкъ	
Sindhi	sd	سنڌي	32
Yagnobi	yai	Йағнобӣ зивок	0.012
Samoan	sm	Gagana faʻa Sāmoa	0.51
Iloko	ilo	Pagsasao nga Ilokano	8.1
Romany	rom	Romani čhib	3.5
Xhosa	xh	IsiXhosa	8.2
Old French (842-ca. 1400)	fro	Franceis	
Khakas	kjh	Хакас	0.043
Old Irish (to 900)	sga	Goídelc	
Skolt Sami	sms	Sääʹmǩiõll	0.00032
Ojibwe	oj	Ojibwe	0.05
Central Yupik	esu	Yupʼik	0.019
Moksha	mdf	Мокшень кяль	0.253
Ingush	inh	ГӀалгӀай мотт	0.5
Elfdalian	ovd	Övdalian	0.002
Ladino	lad	Judeoespañol	0.06
Lü	khb	ᦅᧄᦺᦑᦟᦹᧉ	0.55
Yucatec Maya	yua	Mayaʼ tʼàan	0.77
Inuktitut	iu	ᐃᓄᒃᑎᑐᑦ	0.039
Lingala	ln	Lingála	40
Manchu	mnc	ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ	0.00002
Ligurian	lij	Zeneize	0.6
Mari (Russia)	chm	Марий йылме	0.51
Luyia	luy	Luyia	15
Fijian	fj	Na Vosa Vakaviti	0.32
Aymara	ay	Aymar aru	1.7
Komi-Permyak	koi	Пермяцкӧй кыв	0.063
Svan	sva	ლუშნუ ნინ	0.014
Hiligaynon	hil	Ilonggo	9.3
Classical Syriac	syc	ܠܫܢܐ ܣܘܪܝܝܐ	
Lezghian	lez	Лезги чӏал	0.8
Kabardian	kbd	Адыгэбзэ	0.59
Gagauz	gag	Gagauz dili	0.148
Shona	sn	ChiShona	12
Saterfriesisch	stq	Seeltersk	0.002
Nogai	nog	Ногай тили	0.087
Veps	vep	Vepsän kelʹ	0.0036
Samogitian	sgs	Žemaitiu kalba	0.5
American Sign Language	asl	ASL	0.45
Indo-Pakistani Sign Language		IPSL	6.3
Indonesian Sign Language		BISINDO	0.9
Russian Sign Language		РЖЯ	0.715
Brazilian Sign Language		Libras	0.6
Spanish Sign Language		LSE	0.523
Egyptian Sign Language		ESL	0.474
Persian Sign Language		PSC	0.325
Turkish Sign Language		TİD	0.3
Japanese Sign Language		日本手話	0.126
Mexican Sign Language		LSM	0.13
French Sign Language		LSF	0.1
British Sign Language		BSL	0.08
German Sign Language		DGS	0.08
Malaysian Sign Language		BIM	0.06
Polish Sign Language		PJM	0.04
Italian Sign Language		LIS	0.04
Yugoslav Sign Language		YSL	0.022
Uruguayan Sign Language		LSU	0.02
Hong Kong Sign Language		香港手語	0.02
Dutch Sign Language		 NGT	0.015
Auslan		Auslan	0.01`
	.split('\n')
	.map((line) => {
		const [en, code, name, speakers] = line.split('\t');
		return { en, code, name, speakers: +speakers || 0 };
	})
	.sort((a, b) => b.speakers - a.speakers);

export function getLanguageByCode(code: string): TargetLanguage {
	return targetLanguages.find((l) => l.code === code);
}
