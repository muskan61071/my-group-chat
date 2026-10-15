export function toggleAudioTrack(stream: MediaStream | null, enabled: boolean): void {
  if (!stream) return;
  stream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

export function toggleVideoTrack(stream: MediaStream | null, enabled: boolean): void {
  if (!stream) return;
  stream.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
}
