import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Facility, ProblemCategory, ReportPriority, ProblemReport } from '../../types';
import { getFacilities, getProblemCategories, createReport } from '../../services/firebase';
import { uploadMediaFile } from '../../services/storage';
import { 
  X, 
  Camera, 
  Video, 
  Send, 
  Building, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  UploadCloud,
  Sparkles
} from 'lucide-react';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: ProblemReport) => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  onReportCreated
}) => {
  const { currentUser, t, language } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);

  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ReportPriority>('medium');

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [facs, cats] = await Promise.all([getFacilities(), getProblemCategories()]);
    setFacilities(facs.filter(f => f.active));
    setCategories(cats);
    if (facs.length > 0) setSelectedFacilityId(facs[0].id);
    if (cats.length > 0) setSelectedCategoryId(cats[0].id);
  };

  if (!isOpen || !currentUser) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (photos.length + files.length > 3) {
        setError(language === 'si' ? 'උපරිම ඡායාරූප 3ක් පමණක් ඇතුලත් කළ හැක.' : 'Maximum 3 photos allowed.');
        return;
      }
      const newPhotos = [...photos, ...files].slice(0, 3);
      setPhotos(newPhotos);

      // Generate previews
      const previews = newPhotos.map(file => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(newPreviews);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setError(language === 'si' ? 'වීඩියෝවේ ප්‍රමාණය 25MB ට වඩා අඩු විය යුතුය.' : 'Video must be smaller than 25MB.');
        return;
      }
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityId || !selectedCategoryId || !description.trim()) {
      setError(language === 'si' ? 'කරුණාකර අවශ්‍ය සියලු විස්තර සපයන්න.' : 'Please fill all required details.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Upload media
      const uploadedPhotoUrls: string[] = [];
      for (const p of photos) {
        const url = await uploadMediaFile(p, 'reports');
        uploadedPhotoUrls.push(url);
      }

      const uploadedVideoUrls: string[] = [];
      if (video) {
        const videoUrl = await uploadMediaFile(video, 'reports');
        uploadedVideoUrls.push(videoUrl);
      }

      const selectedFacility = facilities.find(f => f.id === selectedFacilityId);
      const selectedCategory = categories.find(c => c.id === selectedCategoryId);

      const report = await createReport({
        workerId: currentUser.uid,
        workerName: currentUser.name,
        workerEmail: currentUser.email,
        workerPhone: currentUser.phone,
        facilityId: selectedFacilityId,
        facilityName: selectedFacility ? (language === 'si' ? selectedFacility.nameSi : selectedFacility.name) : 'Facility',
        categoryId: selectedCategoryId,
        categoryName: selectedCategory ? (language === 'si' ? selectedCategory.nameSi : selectedCategory.name) : 'Issue',
        departmentId: selectedCategory?.departmentId,
        departmentName: selectedCategory?.departmentName,
        description: description.trim(),
        priority,
        photoUrls: uploadedPhotoUrls,
        videoUrls: uploadedVideoUrls,
      });

      onReportCreated(report);
      onClose();
    } catch (err: any) {
      setError(err?.message || (language === 'si' ? 'වාර්තාව යොමු කිරීම අසාර්ථක විය.' : 'Failed to submit report.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#111724] border border-blue-500/30 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl blue-glow text-slate-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {t('reportProblem')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'si' ? 'ගැටළුව විස්තර කර නඩත්තු අංශයට යොමු කරන්න' : 'Submit facility issue to maintenance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Facility & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                {t('facility')} *
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                required
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id} className="bg-[#101522]">
                    {language === 'si' ? fac.nameSi : fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                {t('problemCategory')} *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#101522]">
                    {language === 'si' ? cat.nameSi : cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority selector */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              {t('priority')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as ReportPriority[]).map((p) => {
                const isSelected = priority === p;
                let colorClass = 'border-slate-800 text-slate-400 bg-[#141a27]';
                if (isSelected) {
                  if (p === 'low') colorClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold';
                  if (p === 'medium') colorClass = 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold';
                  if (p === 'high') colorClass = 'border-amber-500 bg-amber-950/40 text-amber-300 font-semibold';
                  if (p === 'urgent') colorClass = 'border-rose-500 bg-rose-950/40 text-rose-300 font-bold shadow-lg shadow-rose-950/40';
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-1 rounded-xl border text-[11px] text-center capitalize transition-all ${colorClass}`}
                  >
                    {t(`priority_${p}` as any)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              {t('description')} *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              required
              rows={3}
              className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none leading-relaxed"
            />
          </div>

          {/* Photo & Video Uploads */}
          <div className="space-y-3 pt-1">
            {/* Photos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('photoUpload')} ({photos.length}/3)</span>
                </span>
                <span className="text-[10px] text-slate-500">{t('photoHint')}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {photoPreviews.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-blue-500/40 group">
                    <img src={url} alt="Problem Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {photos.length < 3 && (
                  <label className="w-16 h-16 rounded-xl border border-dashed border-blue-500/40 hover:border-blue-400 bg-blue-950/20 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Camera className="w-5 h-5 text-blue-400" />
                    <span className="text-[9px] text-blue-300 mt-1">+ Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Video */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('videoUpload')}</span>
                </span>
                <span className="text-[10px] text-slate-500">{t('videoHint')}</span>
              </div>

              {videoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-blue-500/40 bg-black p-1 max-w-[200px]">
                  <video src={videoPreview} controls className="w-full max-h-24 rounded-lg" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="mt-1 w-full py-1 rounded bg-red-950/80 text-red-300 text-[10px] flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Video</span>
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 text-cyan-300 text-[11px] cursor-pointer transition-all">
                  <Video className="w-4 h-4" />
                  <span>+ {language === 'si' ? 'වීඩියෝවක් එක් කරන්න' : 'Attach Video'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>{t('submitting')}</span>
              ) : (
                <>
                  <span>{t('submitReport')}</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
