async function downloadSubtitles(movie) {
	const OpenSubtitles = new OS(
		'TemporaryUserAgent'
	);
	OpenSubtitles.search({
		imdbid: movie.imdbCode,
		path: process.env.DOWNLOAD_DEST + movie.torrents[0].fileName,
		filesize: movie.torrents[0].size_bytes,
		extensions: ['srt', 'vtt']
	}).then((subtitles) => {
		var path = __dirname + '/subtitles/' + movie.torrents[0].fileName.split('/')[0];
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
		for (i in subtitles) {
			if (["en", "fr"].includes(subtitles[i].langcode)) {
				var file = fs.createWriteStream(path + '/' + subtitles[i].filename);
				http.get(subtitles[i].url, (response) => {
					response.pipe(file);
				});
				movie.torrents[0].subtitles.push({
					language: subtitles[i].lang,
					path: movie.torrents[0].fileName.split('/')[0] + '/' + subtitles[i].filename
				})
			}
		}
		movie.save(error => {
			console.log(error);
		})
	}).catch(error => {
		console.log(error);
	})
}