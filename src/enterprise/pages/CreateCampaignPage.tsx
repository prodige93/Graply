import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, ArrowRight, Save, Send, Check, X, Trash2 } from 'lucide-react';
import GrapeLoader from '../components/GrapeLoader';
import StepOne from '../components/create-campaign/StepOne';
import StepTwo from '../components/create-campaign/StepTwo';
import StepThree from '../components/create-campaign/StepThree';
import StepFour from '../components/create-campaign/StepFour';
import StepFive from '../components/create-campaign/StepFive';
import CampaignPreview from '../components/create-campaign/CampaignPreview';
import { supabase } from '@/shared/infrastructure/supabase';
import { useMyCampaigns } from '@/enterprise/contexts/MyCampaignsContext';

const STEPS = [
  { label: 'General' },
  { label: 'Details' },
  { label: 'Récompense' },
  { label: 'Contenu' },
  { label: 'Paramètres' },
];

interface PlatformBudget {
  amount: string;
  per1000: string;
  min: string;
  max: string;
}

export default function CreateCampaignPage() {
  const navigate = useEnterpriseNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const location = useLocation();
  const { refresh } = useMyCampaigns();
  const isEditMode = location.pathname.includes('/modifier-campagne');
  const backPath = (location.state as { from?: string })?.from || (isEditMode ? '/mes-campagnes' : '/');
  const [step, setStep] = useState(0);
  const [loadingCampaign, setLoadingCampaign] = useState(!!editId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [budget, setBudget] = useState('');
  const [contentType, setContentType] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const [platformBudgets, setPlatformBudgets] = useState<Record<string, PlatformBudget>>({});

  const [information, setInformation] = useState('');
  const [rules, setRules] = useState<string[]>(['']);
  const [documents, setDocuments] = useState<File[]>([]);

  const [requireFollowers, setRequireFollowers] = useState(false);
  const [minFollowers, setMinFollowers] = useState('');
  const [requireApplication, setRequireApplication] = useState(false);
  const [requireReview, setRequireReview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [originalPlatforms, setOriginalPlatforms] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', editId)
        .maybeSingle();
      if (!error && data) {
        setIsDraft(data.status === 'draft');
        setName(data.name || '');
        setDescription(data.description || '');
        if (data.photo_url) setPhotoPreview(data.photo_url);
        setBudget(data.budget || '');
        setContentType(data.content_type || '');
        setCategories(data.categories || []);
        setPlatforms(data.platforms || []);
        setOriginalPlatforms(data.platforms || []);
        setPlatformBudgets(data.platform_budgets || {});
        setInformation(data.information || '');
        setRules(data.rules?.length > 0 ? data.rules : ['']);
        setRequireFollowers(data.require_followers || false);
        setMinFollowers(data.min_followers || '');
        setRequireApplication(data.require_application || false);
        setRequireReview(data.require_review || false);
      }
      setLoadingCampaign(false);
    };
    load();
  }, [editId]);

  const uploadPhoto = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('campaign-images').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('campaign-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const photoUrl = photo ? await uploadPhoto(photo) : (isEditMode ? photoPreview : null);
      const payload = {
        name,
        description,
        photo_url: photoUrl,
        budget,
        content_type: contentType,
        categories,
        platforms,
        platform_budgets: platformBudgets,
        information,
        rules: rules.filter((r) => r.trim().length > 0),
        require_followers: requireFollowers,
        min_followers: minFollowers,
        require_application: requireApplication,
        require_review: requireReview,
        status: 'published',
        ...(user && !isEditMode ? { user_id: user.id } : {}),
      };

      if (isEditMode && editId) {
        const { error } = await supabase.from('campaigns').update(payload).eq('id', editId);
        if (error) throw error;
        refresh();
        navigate(`/ma-campagne/${editId}`);
      } else {
        const { error } = await supabase.from('campaigns').insert(payload);
        if (error) throw error;
        refresh();
        navigate('/mes-campagnes');
      }
    } catch (err) {
      console.error(err);
      setPublishError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (savingDraft) return;
    setSavingDraft(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const photoUrl = photo ? await uploadPhoto(photo) : (isEditMode ? photoPreview : null);
      const payload = {
        name: name || 'Brouillon sans titre',
        description,
        photo_url: photoUrl,
        budget: budget || '0',
        content_type: contentType || 'UGC',
        categories,
        platforms,
        platform_budgets: platformBudgets,
        information,
        rules: rules.filter((r) => r.trim().length > 0),
        require_followers: requireFollowers,
        min_followers: minFollowers,
        require_application: requireApplication,
        require_review: requireReview,
        status: 'draft',
        ...(user && !isEditMode ? { user_id: user.id } : {}),
      };

      if (isEditMode && editId) {
        const { error } = await supabase.from('campaigns').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('campaigns').insert(payload);
        if (error) throw error;
      }
      refresh();
      navigate(backPath);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDraft(false);
    }
  };

  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPhotoPreview(null);
  }, [photo]);

  const isPublishedEdit = isEditMode && !isDraft;

  const hasAnyInput = !!(
    name.trim() ||
    description.trim() ||
    photo ||
    (photoPreview && !isEditMode) ||
    budget.trim() ||
    contentType ||
    categories.length > 0 ||
    platforms.length > 0 ||
    information.trim() ||
    rules.some((r) => r.trim().length > 0) ||
    documents.length > 0 ||
    requireFollowers ||
    requireApplication ||
    requireReview
  );

  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 0:
        return name.trim().length > 0 && (photo !== null || !!photoPreview);
      case 1: {
        const budgetVal = parseFloat(budget.replace(/[^0-9.]/g, '')) || 0;
        return budget.trim().length > 0 && budgetVal >= 500 && contentType.length > 0 && categories.length > 0 && platforms.length > 0;
      }
      case 2: {
        if (isPublishedEdit) return true;
        const totalBudget = parseFloat(budget.replace(/[^0-9.]/g, '')) || 0;
        const totalAllocated = platforms.reduce((sum, id) => sum + (parseFloat((platformBudgets[id]?.amount || '').replace(/[^0-9.]/g, '')) || 0), 0);
        return platforms.length > 0 && totalAllocated <= totalBudget && platforms.every((id) => {
          const pb = platformBudgets[id];
          return pb && pb.per1000.trim().length > 0;
        });
      }
      case 3:
        if (isPublishedEdit) return rules.some((r) => r.trim().length > 0);
        return information.trim().length > 0 && rules.some((r) => r.trim().length > 0);
      default:
        return true;
    }
  };

  const canProceed = isStepValid(step);

  const goNext = () => {
    if (step < STEPS.length - 1 && canProceed) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleDeleteDraft = async () => {
    if (!editId) return;
    setDeleting(true);
    await supabase.from('campaigns').delete().eq('id', editId).eq('status', 'draft');
    setDeleting(false);
    navigate(backPath);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepOne
            name={name} setName={setName}
            description={description} setDescription={setDescription}
            photo={photo} setPhoto={setPhoto}
            photoPreview={photoPreview}
          />
        );
      case 1:
        return (
          <StepTwo
            budget={budget} setBudget={setBudget}
            contentType={contentType} setContentType={setContentType}
            categories={categories} setCategories={setCategories}
            platforms={platforms} setPlatforms={setPlatforms}
            isEditMode={isPublishedEdit}
            originalPlatforms={originalPlatforms}
          />
        );
      case 2:
        return (
          <StepThree
            platforms={platforms}
            budget={budget}
            platformBudgets={platformBudgets}
            setPlatformBudgets={setPlatformBudgets}
            isEditMode={isPublishedEdit}
          />
        );
      case 3:
        return (
          <StepFour
            information={information} setInformation={setInformation}
            rules={rules} setRules={setRules}
            documents={documents} setDocuments={setDocuments}
            isEditMode={isPublishedEdit}
          />
        );
      case 4:
        return (
          <StepFive
            requireFollowers={requireFollowers} setRequireFollowers={setRequireFollowers}
            minFollowers={minFollowers} setMinFollowers={setMinFollowers}
            requireApplication={requireApplication} setRequireApplication={setRequireApplication}
            requireReview={requireReview} setRequireReview={setRequireReview}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  if (loadingCampaign) {
    return (
      <div className="text-white min-h-screen" style={{ backgroundColor: '#050404' }}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
          <div className="h-8 w-52 rounded-lg animate-pulse mb-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
            ))}
          </div>
          <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.055)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => !isEditMode && !hasAnyInput ? navigate(backPath) : setShowExitModal(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="sm:hidden">{isEditMode ? 'Modifier votre campagne' : 'Creer une campagne'}</span>
              <span className="hidden sm:inline">{isEditMode ? 'Modifier votre campagne' : 'Creation de votre nouvelle campagne'}</span>
            </h1>
            <p className="text-xs text-white/40 mt-1">Les champs marques d'un <span style={{ color: '#F97316' }}>*</span> sont obligatoires.</p>
          </div>
          {isDraft && editId && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:bg-red-500/15 active:scale-95 shrink-0 group"
              style={{ border: '1px solid rgba(239,68,68,0.2)' }}
              title="Supprimer le brouillon"
            >
              <Trash2 className="w-[18px] h-[18px] text-red-400 group-hover:text-red-300 transition-colors" />
            </button>
          )}
        </div>

        <div className="flex items-start gap-6 lg:gap-16">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <button
                    onClick={() => {
                      if (i <= step) setStep(i);
                      else {
                        let valid = true;
                        for (let s = step; s < i; s++) {
                          if (!isStepValid(s)) { valid = false; break; }
                        }
                        if (valid) setStep(i);
                      }
                    }}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                      style={{
                        backgroundColor: i < step ? 'rgba(255,255,255,0.12)' : i === step ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: i < step ? '2px solid rgba(255,255,255,0.4)' : i === step ? '2px solid rgba(255,255,255,0.4)' : '2px solid rgba(255,255,255,0.06)',
                        color: i < step ? '#fff' : i === step ? '#fff' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span
                      className="text-xs font-medium hidden sm:block transition-colors"
                      style={{ color: i <= step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)' }}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-px mx-3 transition-colors duration-300"
                      style={{ backgroundColor: i < step ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)' }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-4 lg:p-10"
              style={{
                background: 'rgba(255,255,255,0.055)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
              }}
            >
              {renderStep()}
            </div>

            <div className="flex items-center justify-between mt-8">
              {(!isEditMode || isDraft) ? (
                <div
                  className="rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="flex items-center gap-2 px-3 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium text-white/45 hover:text-white/65 transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {savingDraft ? <GrapeLoader size="sm" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                    <span className="hidden sm:inline">{savingDraft ? 'Sauvegarde...' : 'Enregistrer comme brouillon'}</span>
                    <span className="sm:hidden">{savingDraft ? 'Sauvegarde...' : 'Brouillon'}</span>
                  </button>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                )}

                {publishError && isLastStep && (
                  <p className="text-red-400 text-xs font-medium mr-2">{publishError}</p>
                )}
                {!isLastStep ? (
                  <button
                    onClick={goNext}
                    disabled={!canProceed}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: canProceed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: canProceed ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      color: canProceed ? '#fff' : 'rgba(255,255,255,0.2)',
                      cursor: canProceed ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="relative sm:group">
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[70%] h-3 rounded-full blur-lg opacity-0 sm:group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(90deg, rgba(59,130,246,0.5), rgba(236,72,153,0.3), rgba(251,146,60,0.35))',
                      }}
                    />
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="relative flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold sm:transition-all sm:duration-300 sm:hover:scale-[1.02] sm:active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#111111',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      }}
                    >
                      <span
                        className="flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6, #EC4899, #F97316)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {publishing ? (
                          <GrapeLoader size="sm" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" style={{ stroke: 'url(#publier-gradient)' }} />
                            <svg width="0" height="0" className="absolute">
                              <defs>
                                <linearGradient id="publier-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#3B82F6" />
                                  <stop offset="50%" stopColor="#EC4899" />
                                  <stop offset="100%" stopColor="#F97316" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </>
                        )}
                      </span>
                      <span className="hidden sm:inline">{publishing ? (isEditMode ? 'Mise a jour...' : 'Publication...') : (isEditMode ? 'Enregistrer les modifications' : 'Publier la campagne')}</span>
                      <span className="sm:hidden">{publishing ? '' : 'Publier'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-[360px] shrink-0 hidden lg:block ml-8">
            <CampaignPreview
              name={name}
              photoPreview={photoPreview}
              contentType={contentType}
              categories={categories}
              platforms={platforms}
              budget={budget}
              platformBudgets={platformBudgets}
            />
          </div>
        </div>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div
            className="relative w-full max-w-md rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(30,30,30,0.98), rgba(18,18,18,0.98))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            {isEditMode && !isDraft ? (
              <>
                <h3 className="text-lg font-bold text-white mb-2">Quitter la modification ?</h3>
                <p className="text-sm text-white/50 mb-8 leading-relaxed">
                  Vos modifications ne seront pas prises en compte.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ backgroundColor: '#fff', color: '#111' }}
                  >
                    Continuer la modification
                  </button>
                  <button
                    onClick={() => navigate(backPath)}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/[0.06]"
                    style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Quitter sans enregistrer
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-2">Quitter la creation ?</h3>
                <p className="text-sm text-white/50 mb-8 leading-relaxed">
                  Vous etes sur le point de quitter cette page. Souhaitez-vous enregistrer votre campagne en tant que brouillon ?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    style={{ backgroundColor: '#fff', color: '#111' }}
                  >
                    {savingDraft ? <GrapeLoader size="sm" /> : <Save className="w-4 h-4" />}
                    {savingDraft ? 'Sauvegarde...' : 'Enregistrer comme brouillon'}
                  </button>
                  <button
                    onClick={() => navigate(backPath)}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/[0.06]"
                    style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Quitter sans enregistrer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div
            className="relative w-full max-w-md rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(30,30,30,0.98), rgba(18,18,18,0.98))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Supprimer le brouillon ?</h3>
            </div>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Cette action est irreversible. Le brouillon de cette campagne sera definitivement supprime.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteDraft}
                disabled={deleting}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundColor: '#ef4444', color: '#fff' }}
              >
                {deleting ? <GrapeLoader size="sm" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Suppression...' : 'Supprimer definitivement'}
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/[0.06]"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
