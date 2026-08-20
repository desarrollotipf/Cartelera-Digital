const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ytDlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');

/**
 * Descarga y almacena localmente cualquier video de TikTok, YouTube, Shorts, Vimeo o MP4 directo.
 * @param {string} rawUrl - URL del video web
 * @returns {Promise<{ url: string, name: string, orientation: 'portrait' | 'landscape' }>}
 */
async function processAndDownloadVideo(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url) throw new Error('URL de video requerida');

  const uploadsDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const finalFilename = `vid_${Date.now()}_${Math.round(Math.random() * 1000)}.mp4`;
  const finalFilePath = path.join(uploadsDir, finalFilename);
  const localUrl = `/uploads/${finalFilename}`;

  // 1. ESTRATEGIA TIKTOK ULTRA-RÁPIDA (TikWM API - Descarga en ~500ms)
  if (url.includes('tiktok.com')) {
    try {
      console.log(' [VideoDownloader] Extracción rápida TikTok vía TikWM API:', url);
      const res = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({
        url: url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      });

      if (res.data && res.data.code === 0 && res.data.data?.play) {
        const directPlayUrl = res.data.data.hdplay || res.data.data.play;
        const title = res.data.data.title || 'TikTok Corporativo';
        
        console.log(' [VideoDownloader] Descargando stream directo de TikTok...');
        const streamRes = await axios({
          url: directPlayUrl,
          method: 'GET',
          responseType: 'stream',
          timeout: 20000
        });

        const writer = fs.createWriteStream(finalFilePath);
        streamRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        console.log(' [VideoDownloader] ¡TikTok listo al instante!: ', localUrl);
        return {
          url: localUrl,
          name: title.slice(0, 45) || 'TikTok Corporativo',
          orientation: 'portrait'
        };
      }
    } catch (tikErr) {
      console.warn(' [VideoDownloader] TikWM falló, intentando con yt-dlp:', tikErr.message);
    }
  }

  // 2. ESTRATEGIA DIRECTA MP4 / WEBM (Si ya es un enlace directo de archivo)
  if (/\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(url)) {
    try {
      console.log(' [VideoDownloader] Descarga de archivo directo:', url);
      const streamRes = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(finalFilePath);
      streamRes.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      return {
        url: localUrl,
        name: 'Video MP4 Directo',
        orientation: 'landscape'
      };
    } catch (directErr) {
      console.warn(' [VideoDownloader] Falló descarga directa:', directErr.message);
    }
  }

  // 3. ESTRATEGIA UNIVERSAL YT-DLP ACELERADA (YouTube, Shorts, Vimeo)
  try {
    let cleanTargetUrl = url;
    let isShort = url.includes('/shorts/');
    let videoTitle = isShort ? 'Short Corporativo' : 'Video Corporativo';

    // Limpieza de URLs de YouTube y obtención de título oEmbed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([\w-]{11})/);
      if (match && match[1]) {
        const videoId = match[1];
        cleanTargetUrl = isShort ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`;
      }
      try {
        const oembedRes = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanTargetUrl)}&format=json`, { timeout: 4000 });
        if (oembedRes.data && oembedRes.data.title) {
          videoTitle = oembedRes.data.title;
        }
      } catch (_) {}
    }

    console.log(' [VideoDownloader] Descarga ultra-rápida con yt-dlp:', cleanTargetUrl);
    
    // Descarga rápida con resolución óptima 720p H.264
    await ytDlp(cleanTargetUrl, {
      output: finalFilePath,
      format: 'bv*[height<=720]+ba/b[height<=720]/best[height<=720]/best',
      mergeOutputFormat: 'mp4',
      extractorArgs: 'youtube:player_client=web,mweb,android,ios',
      ffmpegLocation: ffmpegPath,
      noCheckCertificates: true,
      noWarnings: true
    });

    if (fs.existsSync(finalFilePath)) {
      console.log(' [VideoDownloader] ¡Video de YouTube descargado como MP4 local con éxito!:', localUrl);
      return {
        url: localUrl,
        name: videoTitle,
        orientation: isShort ? 'portrait' : 'landscape'
      };
    }
  } catch (ytErr) {
    console.error(' [VideoDownloader] Error en yt-dlp:', ytErr.message);
  }

  // Fallback seguro si no se pudo descargar
  return {
    url: url,
    name: 'Video Enlace Web',
    orientation: url.includes('/shorts/') || url.includes('tiktok.com') ? 'portrait' : 'landscape'
  };
}

module.exports = {
  processAndDownloadVideo
};
