use std::io::Cursor;
use std::path::Path;
use tauri::Manager;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

#[tauri::command]
fn transcribe_wav(app: tauri::AppHandle, wav_bytes: Vec<u8>) -> Result<String, String> {
    let model = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join("models/ggml-tiny.en.bin");
    transcribe_wav_with_model(&wav_bytes, &model)
}

fn transcribe_wav_with_model(wav_bytes: &[u8], model: &Path) -> Result<String, String> {
    let samples = decode_wav(wav_bytes)?;
    if !model.exists() {
        return Err("The local transcription model is not installed.".into());
    }
    let context = WhisperContext::new_with_params(
        model.to_string_lossy().as_ref(),
        WhisperContextParameters::default(),
    )
    .map_err(|e| format!("Could not load the local model: {e}"))?;
    let mut state = context
        .create_state()
        .map_err(|e| format!("Could not start transcription: {e}"))?;
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_n_threads(
        std::thread::available_parallelism()
            .map(|n| n.get().min(6) as i32)
            .unwrap_or(2),
    );
    params.set_translate(false);
    params.set_language(Some("en"));
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    params.set_debug_mode(false);
    state
        .full(params, &samples)
        .map_err(|e| format!("Local transcription failed: {e}"))?;
    let count = state.full_n_segments().map_err(|e| e.to_string())?;
    let mut transcript = String::new();
    for i in 0..count {
        transcript.push_str(
            state
                .full_get_segment_text(i)
                .map_err(|e| e.to_string())?
                .trim(),
        );
        transcript.push(' ');
    }
    Ok(transcript.trim().to_string())
}

fn decode_wav(wav_bytes: &[u8]) -> Result<Vec<f32>, String> {
    let mut reader = hound::WavReader::new(Cursor::new(wav_bytes))
        .map_err(|e| format!("Could not read recording: {e}"))?;
    let spec = reader.spec();
    if spec.channels != 1 {
        return Err("The recording must contain one audio channel.".into());
    }
    let raw: Result<Vec<f32>, _> = reader
        .samples::<i16>()
        .map(|sample| sample.map(|value| value as f32 / 32768.0))
        .collect();
    let raw = raw.map_err(|e| format!("Could not decode recording: {e}"))?;
    Ok(if spec.sample_rate == 16_000 {
        raw
    } else {
        resample(&raw, spec.sample_rate, 16_000)
    })
}

fn resample(input: &[f32], from: u32, to: u32) -> Vec<f32> {
    if input.is_empty() {
        return vec![];
    }
    let len = (input.len() as u64 * to as u64 / from as u64) as usize;
    (0..len)
        .map(|i| {
            let pos = i as f64 * from as f64 / to as f64;
            let left = pos.floor() as usize;
            let right = (left + 1).min(input.len() - 1);
            let mix = (pos - left as f64) as f32;
            input[left] * (1.0 - mix) + input[right] * mix
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![transcribe_wav])
        .run(tauri::generate_context!())
        .expect("error while running Spoken Dev Brief");
}

#[cfg(test)]
mod tests {
    use super::{decode_wav, resample, transcribe_wav_with_model};
    use std::path::PathBuf;

    #[test]
    fn resamples_audio_to_whisper_rate() {
        assert_eq!(resample(&vec![0.0; 48_000], 48_000, 16_000).len(), 16_000);
    }

    // @claim:local-transcription-core
    #[test]
    fn local_transcription_core() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let wav = std::fs::read(root.join("../tests/fixtures/jfk.wav"))
            .expect("the fixed speech fixture must be available");
        let samples = decode_wav(&wav).expect("the WAV fixture must decode");
        assert!(!samples.is_empty());
        let transcript =
            transcribe_wav_with_model(&wav, &root.join("resources/models/ggml-tiny.en.bin"))
                .expect("the packaged local model must transcribe the WAV fixture");
        let normalized = transcript.to_lowercase();
        assert!(normalized.contains("fellow americans"), "{transcript}");
    }
}
