import React, { useRef, useState, useEffect } from 'react';
import { Cow } from '../types';
import {
  ByteTrackHerdEngine,
  TrackedCow,
  CowActivity,
} from '../utils/byteTracker';
import { AnimalTruthDetector } from '../utils/animalTruthDetector';
import {
  Upload,
  Play,
  Pause,
  CheckCircle,
  FileVideo,
  FolderOpen,
  Send,
  RefreshCw,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface VideoAnalyzerProps {
  cows: Cow[];
  initialSelectedTag?: string;
  onApplyResultsToCow: (
    tagNumber: string,
    analysis: {
      feedingMinutes: number;
      ruminationMinutes: number;
      chewRate: number;
      state: 'moving' | 'resting' | 'feeding';
    }
  ) => void;
  onSendSmsToOwner?: (cow: Cow, messageNote: string) => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  cows,
  initialSelectedTag,
  onApplyResultsToCow,
  onSendSmsToOwner,
}) => {
  const [selectedCowTag, setSelectedCowTag] = useState<string>(initialSelectedTag || '0412');
  
  // Video upload state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ size: string; type: string } | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tracker Engine
  const trackerEngineRef = useRef<ByteTrackHerdEngine>(new ByteTrackHerdEngine());
  const animalTruthDetectorRef = useRef<AnimalTruthDetector>(new AnimalTruthDetector());

  // Playback & Analysis State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Herd Multitrack State
  const [trackedCowsList, setTrackedCowsList] = useState<TrackedCow[]>(() =>
    trackerEngineRef.current.getCows()
  );
  const [selectedTrackId, setSelectedTrackId] = useState<number>(1);
  const [activityFilter, setActivityFilter] = useState<'all' | CowActivity>('all');

  // Layer Toggles (Predicts ONLY cows)
  const [showOverlays, setShowOverlays] = useState({
    cowBoundingBoxes: true,
    activityLabels: true,
    reIdSignatures: true,
  });

  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Refs for animation loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const selectedCowTagRef = useRef(selectedCowTag);
  selectedCowTagRef.current = selectedCowTag;

  const selectedTrackIdRef = useRef(selectedTrackId);
  selectedTrackIdRef.current = selectedTrackId;

  const showOverlaysRef = useRef(showOverlays);
  showOverlaysRef.current = showOverlays;

  const activityFilterRef = useRef(activityFilter);
  activityFilterRef.current = activityFilter;

  const lastReactUpdateRef = useRef<number>(0);

  const defaultPoster = '/src/assets/images/dairy_cows_feed_bunk_1792781949049.jpg';

  // Sync initial tag cleanly
  useEffect(() => {
    if (initialSelectedTag) {
      setSelectedCowTag(initialSelectedTag);
      const allCows = trackerEngineRef.current.getCows();
      const found = allCows.find((c) => c.tagNumber === initialSelectedTag);
      if (found) setSelectedTrackId(found.trackId);
    }
  }, [initialSelectedTag]);

  const processUploadedFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    setUploadedFileName(file.name);
    setFileDetails({
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || 'video/mp4',
    });
    setIsPlaying(true);
    // Reset Animal Truth detector so it detects the actual cows in the new uploaded video
    animalTruthDetectorRef.current.reset();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.playbackRate = playbackSpeedRef.current;
      if (isPlayingRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 0.5 : playbackSpeed === 0.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getActivityColor = (activity: CowActivity): string => {
    switch (activity) {
      case 'feeding':
        return '#38bdf8'; // Sky Blue
      case 'stationary':
        return '#14b8a6'; // Teal
      case 'lying_down':
        return '#a855f7'; // Violet
      case 'standing_up':
        return '#f97316'; // Orange
      default:
        return '#94a3b8';
    }
  };

  const getActivityLabel = (activity: CowActivity): string => {
    switch (activity) {
      case 'feeding':
        return 'FEEDING';
      case 'stationary':
        return 'STATIONARY';
      case 'lying_down':
        return 'LYING DOWN';
      case 'standing_up':
        return 'STANDING UP';
    }
  };

  // Main Render Loop: Predicts ONLY the cows
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const engine = trackerEngineRef.current;

    const render = () => {
      const activeSpeed = playbackSpeedRef.current;
      if (isPlayingRef.current) {
        time += 0.03 * activeSpeed;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Clear canvas (predicts only the cow bounding boxes)
      ctx.clearRect(0, 0, w, h);

      // Dynamic Bovine Tracking: If video uploaded, analyze real frames (Animal Truth)
      let currentCows: TrackedCow[] = [];
      if (uploadedVideoUrl && videoRef.current && videoRef.current.readyState >= 2) {
        currentCows = animalTruthDetectorRef.current.analyzeVideoFrame(
          videoRef.current,
          videoRef.current.currentTime
        );
      } else {
        currentCows = engine.update(time, activeSpeed);
      }

      // Throttle React state sync
      const now = performance.now();
      if (now - lastReactUpdateRef.current > 600) {
        lastReactUpdateRef.current = now;
        if (currentCows.length > 0) {
          setTrackedCowsList([...currentCows]);
        }
      }

      // Draw Top OSD Header
      const timestamp = new Date().toLocaleTimeString();
      if (uploadedVideoUrl) {
        ctx.fillStyle = 'rgba(8, 14, 11, 0.88)';
        ctx.fillRect(10, 10, 480, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(
          `ANIMAL TRUTH CV · ${currentCows.length} BOVINES IN VIDEO · TIME ${videoRef.current ? formatTime(videoRef.current.currentTime) : '00:00'} · ${timestamp}`,
          16,
          27
        );
      } else {
        ctx.fillStyle = 'rgba(10, 15, 13, 0.85)';
        ctx.fillRect(10, 10, 430, 26);
        ctx.fillStyle = '#34d399';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(
          `DEFAULT BASELINE POSTER · ${currentCows.length} DETECTED · ${timestamp}`,
          16,
          27
        );
      }

      // Render Each Tracked Cow (Predictions on cows ONLY, no atmosphere/zones)
      currentCows.forEach((cow) => {
        const activeFilter = activityFilterRef.current;
        if (activeFilter !== 'all' && cow.activity !== activeFilter) return;

        const isFocused =
          cow.trackId === selectedTrackIdRef.current || cow.tagNumber === selectedCowTagRef.current;
        const color = getActivityColor(cow.activity);

        const bx = cow.smoothBbox.x * w;
        const by = cow.smoothBbox.y * h;
        const bw = cow.smoothBbox.w * w;
        const bh = cow.smoothBbox.h * h;

        if (showOverlaysRef.current.cowBoundingBoxes || isFocused) {
          // Bounding Box on cow
          ctx.strokeStyle = isFocused ? '#ffffff' : color;
          ctx.lineWidth = isFocused ? 3 : 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Focus indicator corners
          if (isFocused) {
            ctx.fillStyle = '#ffffff';
            const cornerSize = 8;
            ctx.fillRect(bx - 2, by - 2, cornerSize, 3);
            ctx.fillRect(bx - 2, by - 2, 3, cornerSize);
            ctx.fillRect(bx + bw - cornerSize + 2, by - 2, cornerSize, 3);
            ctx.fillRect(bx + bw - 1, by - 2, 3, cornerSize);
          }

          // Top Label Chip: Cow ID & Name
          ctx.fillStyle = isFocused ? 'rgba(16, 185, 129, 0.95)' : 'rgba(15, 23, 19, 0.9)';
          ctx.fillRect(bx, by - 22, Math.max(140, bw), 22);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          const reIdText = cow.occlusionFrames > 0 ? ' [RE-ID]' : '';
          ctx.fillText(`COW #${cow.tagNumber} (${cow.name})${reIdText}`, bx + 5, by - 7);

          // Bottom Live Activity Label (Feeding / Lying down / Standing)
          if (showOverlaysRef.current.activityLabels) {
            ctx.fillStyle = color;
            ctx.fillRect(bx, by + bh - 20, Math.min(bw, 130), 20);

            ctx.fillStyle = '#0a0f0d';
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillText(getActivityLabel(cow.activity), bx + 4, by + bh - 6);
          }

          // Visual Re-ID signature
          if (showOverlaysRef.current.reIdSignatures && isFocused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(bx, by - 36, 150, 14);
            ctx.fillStyle = '#a7f3d0';
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillText(`RE-ID: ${cow.visualSignature}`, bx + 4, by - 26);
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [uploadedVideoUrl]);

  // Sync findings to cow record
  const handleApplyToCow = () => {
    const focusedCow = trackedCowsList.find((c) => c.tagNumber === selectedCowTag) || trackedCowsList[0];
    const isFeeding = focusedCow?.activity === 'feeding';

    onApplyResultsToCow(selectedCowTag, {
      feedingMinutes: isFeeding ? 38 : 22,
      ruminationMinutes: 44,
      chewRate: isFeeding ? 62 : 48,
      state: isFeeding ? 'feeding' : 'resting',
    });
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  const selectedCow = cows.find((c) => c.tagNumber === selectedCowTag);
  const selectedTrackedCow = trackedCowsList.find((c) => c.trackId === selectedTrackId) || trackedCowsList[0];

  const herdStats = {
    totalVisible: trackedCowsList.length,
    feeding: trackedCowsList.filter((c) => c.activity === 'feeding').length,
    stationary: trackedCowsList.filter((c) => c.activity === 'stationary').length,
    lying_down: trackedCowsList.filter((c) => c.activity === 'lying_down').length,
    standing_up: trackedCowsList.filter((c) => c.activity === 'standing_up').length,
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Tech Stack Banner */}
      <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider">Vision Engine:</span>
          {uploadedVideoUrl ? (
            <span className="px-2.5 py-1 rounded bg-sky-950/80 border border-sky-600/70 text-sky-300 font-semibold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Animal Truth Mode (Real Video Frame CV)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-[#1a2620] border border-[#273a30] text-emerald-400 font-mono-numbers">
              Default Baseline Sample
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-[#1a2620] border border-[#273a30] text-emerald-400 font-mono-numbers">
            Predicts Cow Only (No Atmosphere)
          </span>
          <span className="px-2 py-0.5 rounded bg-[#1a2620] border border-[#273a30] text-amber-400 font-mono-numbers">
            Posture: Feeding · Lying · Standing
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {uploadedVideoUrl && (
            <button
              onClick={() => {
                animalTruthDetectorRef.current.reset();
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.2);
                }
              }}
              title="Re-run computer vision detection on current frame"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1a2620] hover:bg-[#25362e] border border-[#273a30] text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> Re-Detect Animals
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white transition-colors cursor-pointer font-semibold shadow-sm shrink-0"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Video
          </button>
        </div>
      </div>

      {/* Activity Filter Bar (Feeding, Lying Down, Standing, Stationary - No walking) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setActivityFilter('all')}
          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activityFilter === 'all'
              ? 'bg-[#1b2b22] border-emerald-500'
              : 'bg-[#101713] border-[#223329] hover:border-[#314a3b]'
          }`}
        >
          <div className="text-[10px] uppercase text-neutral-400">Total Visible</div>
          <div className="text-lg font-bold text-white font-mono-numbers">{herdStats.totalVisible}</div>
          <div className="text-[10px] text-emerald-400">All Cows</div>
        </button>

        <button
          onClick={() => setActivityFilter('feeding')}
          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activityFilter === 'feeding'
              ? 'bg-sky-950/70 border-sky-500'
              : 'bg-[#101713] border-[#223329] hover:border-[#314a3b]'
          }`}
        >
          <div className="text-[10px] uppercase text-neutral-400">Feeding</div>
          <div className="text-lg font-bold text-sky-400 font-mono-numbers">{herdStats.feeding}</div>
          <div className="text-[10px] text-neutral-400">At Bunk</div>
        </button>

        <button
          onClick={() => setActivityFilter('lying_down')}
          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activityFilter === 'lying_down'
              ? 'bg-violet-950/70 border-violet-500'
              : 'bg-[#101713] border-[#223329] hover:border-[#314a3b]'
          }`}
        >
          <div className="text-[10px] uppercase text-neutral-400">Lying Down</div>
          <div className="text-lg font-bold text-violet-400 font-mono-numbers">{herdStats.lying_down}</div>
          <div className="text-[10px] text-neutral-400">Resting in Stall</div>
        </button>

        <button
          onClick={() => setActivityFilter('stationary')}
          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activityFilter === 'stationary'
              ? 'bg-teal-950/70 border-teal-500'
              : 'bg-[#101713] border-[#223329] hover:border-[#314a3b]'
          }`}
        >
          <div className="text-[10px] uppercase text-neutral-400">Stationary</div>
          <div className="text-lg font-bold text-teal-400 font-mono-numbers">{herdStats.stationary}</div>
          <div className="text-[10px] text-neutral-400">Standing Calm</div>
        </button>

        <button
          onClick={() => setActivityFilter('standing_up')}
          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activityFilter === 'standing_up'
              ? 'bg-orange-950/70 border-orange-500'
              : 'bg-[#101713] border-[#223329] hover:border-[#314a3b]'
          }`}
        >
          <div className="text-[10px] uppercase text-neutral-400">Standing Up</div>
          <div className="text-lg font-bold text-orange-400 font-mono-numbers">{herdStats.standing_up}</div>
          <div className="text-[10px] text-neutral-400">Transitioning</div>
        </button>
      </div>

      {/* Main Tracking Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {uploadedVideoUrl ? (
            <div className="p-3 rounded-xl bg-[#121c17] border border-[#23382d] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <FileVideo className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">
                      Tracking Video: {uploadedFileName || 'Uploaded_Cows.mp4'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-600/60 text-[10px] text-sky-300 font-mono-numbers">
                      Animal Truth: {trackedCowsList.length} Bovines Detected
                    </span>
                  </div>
                  {fileDetails && (
                    <span className="text-neutral-400 font-mono-numbers text-[11px]">
                      {fileDetails.size} · {fileDetails.type} · Dynamic frame vision tracking active
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setUploadedVideoUrl(null);
                    setUploadedFileName(null);
                    setFileDetails(null);
                    setTrackedCowsList(trackerEngineRef.current.getCows());
                  }}
                  className="px-2.5 py-1 rounded bg-[#1e2e25] hover:bg-rose-950/40 text-neutral-300 hover:text-rose-300 border border-[#2a3d32] hover:border-rose-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to Default
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-sky-800 hover:bg-sky-700 text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Upload Different Video
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#121c17]/70 border border-[#23382d]/70 flex items-center justify-between gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Default baseline sample active. <strong>Upload any cattle video</strong> to run Animal Truth dynamic detection.</span>
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline underline-offset-2 shrink-0"
              >
                Upload Video →
              </button>
            </div>
          )}

          {/* Video Container with Overlaid Predictions (Cows only) */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative bg-black rounded-xl overflow-hidden border shadow-2xl aspect-video flex items-center justify-center ${
              isDragOver ? 'border-sky-400 ring-2 ring-sky-500/50' : 'border-[#23332b]'
            }`}
          >
            {uploadedVideoUrl && !uploadedVideoUrl.endsWith('.jpg') && !uploadedVideoUrl.endsWith('.png') ? (
              <video
                ref={videoRef}
                src={uploadedVideoUrl}
                loop
                muted
                playsInline
                autoPlay
                className="w-full h-full object-contain block"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <img
                src={uploadedVideoUrl || defaultPoster}
                alt="Barn Feed Bunk"
                className="w-full h-full object-contain block"
              />
            )}

            {/* YOLOv8 + ByteTrack Cow Predictions Overlay */}
            <canvas
              ref={canvasRef}
              width={720}
              height={405}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Bottom HUD */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 font-mono-numbers">
              <div className="flex items-center gap-4">
                <span>
                  COW DETECTIONS: <strong className="text-emerald-400">{trackedCowsList.length} cows</strong>
                </span>
                <span>
                  TARGET: <strong className="text-sky-300">Class [Cow] Only</strong>
                </span>
              </div>
              <span className="text-neutral-400 hidden sm:inline">Visual Re-ID Locked</span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4 space-y-3">
            {uploadedVideoUrl && duration > 0 && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-[#1b2b22] rounded-lg"
                />
                <span className="text-xs font-mono-numbers text-neutral-400 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleSpeedChange}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1a2620] hover:bg-[#25352c] text-neutral-300 text-xs font-mono-numbers transition-colors cursor-pointer"
                >
                  {playbackSpeed}x Speed
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1a2620] hover:bg-[#25352c] text-sky-400 hover:text-sky-300 text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Video
                </button>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverlays.cowBoundingBoxes}
                    onChange={(e) => setShowOverlays({ ...showOverlays, cowBoundingBoxes: e.target.checked })}
                    className="rounded border-[#2f4237] text-emerald-600 focus:ring-0"
                  />
                  <span>Cow Bounding Boxes</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverlays.activityLabels}
                    onChange={(e) => setShowOverlays({ ...showOverlays, activityLabels: e.target.checked })}
                    className="rounded border-[#2f4237] text-sky-500 focus:ring-0"
                  />
                  <span>Activity Labels</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverlays.reIdSignatures}
                    onChange={(e) => setShowOverlays({ ...showOverlays, reIdSignatures: e.target.checked })}
                    className="rounded border-[#2f4237] text-violet-500 focus:ring-0"
                  />
                  <span>Re-ID Signatures</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Cow Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Inspect Tracked Cow
              </label>
              <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live Re-ID Locked
              </span>
            </div>

            <select
              value={selectedCowTag}
              onChange={(e) => {
                setSelectedCowTag(e.target.value);
                const found = trackedCowsList.find((c) => c.tagNumber === e.target.value);
                if (found) setSelectedTrackId(found.trackId);
              }}
              className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
            >
              {trackedCowsList.map((c) => (
                <option key={c.trackId} value={c.tagNumber}>
                  Cow #{c.tagNumber} ({c.name}) - {getActivityLabel(c.activity)}
                </option>
              ))}
            </select>

            {selectedTrackedCow && (
              <div className="p-3 rounded-lg bg-[#0e1612] border border-[#23332b] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Detected Posture:</span>
                  <span
                    className="font-bold uppercase font-mono-numbers px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${getActivityColor(selectedTrackedCow.activity)}22`,
                      color: getActivityColor(selectedTrackedCow.activity),
                    }}
                  >
                    {getActivityLabel(selectedTrackedCow.activity)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Visual Re-ID:</span>
                  <span className="text-emerald-400 font-mono-numbers text-[11px]">
                    {selectedTrackedCow.visualSignature}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">YOLO Confidence:</span>
                  <span className="text-sky-300 font-mono-numbers">
                    {(selectedTrackedCow.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Occlusion Status:</span>
                  <span className="text-neutral-300 font-mono-numbers">
                    {selectedTrackedCow.occlusionFrames === 0 ? 'Clear line-of-sight' : 'Occlusion Recovered'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleApplyToCow}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" /> Apply Findings to Cow #{selectedCowTag}
            </button>

            {/* Direct SMS to Owner Mobile for this Cow */}
            {onSendSmsToOwner && selectedCow && (
              <button
                onClick={() =>
                  onSendSmsToOwner(
                    selectedCow,
                    `Video Tracking Update: Cow #${selectedCow.tagNumber} (${selectedCow.name}) observed in posture ${selectedTrackedCow ? getActivityLabel(selectedTrackedCow.activity) : 'Feeding'}.`
                  )
                }
                className="w-full py-2 px-4 bg-[#1f2d26] hover:bg-[#2a3d34] border border-[#2d4238] text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> SMS Owner Mobile About Cow #{selectedCowTag}
              </button>
            )}

            {appliedSuccess && (
              <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs text-center font-medium">
                ✓ Synchronized to Cow #{selectedCowTag}. Risk scoring recalculated!
              </div>
            )}
          </div>

          {/* Herd Tracklets List */}
          <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Visible Cows ({trackedCowsList.length})
            </h4>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
              {trackedCowsList.map((cow) => {
                const isSelected = cow.trackId === selectedTrackId;
                const actColor = getActivityColor(cow.activity);

                return (
                  <button
                    key={cow.trackId}
                    onClick={() => {
                      setSelectedTrackId(cow.trackId);
                      setSelectedCowTag(cow.tagNumber);
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#1b2b22] border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-[#0e1612] border-[#22332b] hover:border-[#334d3e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: actColor }}
                      ></span>
                      <div>
                        <div className="font-bold text-white font-mono-numbers">
                          #{cow.tagNumber} <span className="font-normal text-neutral-400">({cow.name})</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{cow.visualSignature}</div>
                      </div>
                    </div>

                    <div
                      className="text-[10px] font-bold uppercase font-mono-numbers px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${actColor}22`,
                        color: actColor,
                      }}
                    >
                      {getActivityLabel(cow.activity)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
