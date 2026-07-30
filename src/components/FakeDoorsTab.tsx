import React, { useState, useEffect } from "react";
import { Plus, Copy, Check, Sparkles, Trash2, Edit2, Lock, ToggleLeft, ToggleRight, ArrowRight, MousePointerClick } from "lucide-react";
import { FakeDoor, User } from "../types";
import { api } from "../services/api";

interface FakeDoorsTabProps {
  user: User;
  onNavigateTab: (tab: string) => void;
}

export const FakeDoorsTab: React.FC<FakeDoorsTabProps> = ({ user, onNavigateTab }) => {
  const [fakeDoors, setFakeDoors] = useState<FakeDoor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoor, setEditingDoor] = useState<FakeDoor | null>(null);

  const [featureName, setFeatureName] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [buttonText, setButtonText] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const activeCaps = { free: 1, basic: 3, pro: 999 };
  const activeCount = fakeDoors.filter((fd) => fd.is_active).length;
  const isCapReached = activeCount >= activeCaps[user.plan];

  const fetchFakeDoors = async () => {
    try {
      const data = await api.getFakeDoors();
      setFakeDoors(data.fake_doors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFakeDoors();
  }, []);

  const openCreateModal = () => {
    setEditingDoor(null);
    setFeatureName("");
    setFeatureDesc("");
    setButtonText("Notify Me");
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (door: FakeDoor) => {
    setEditingDoor(door);
    setFeatureName(door.feature_name);
    setFeatureDesc(door.feature_description);
    setButtonText(door.button_text);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!featureName.trim()) {
      setErrorMsg("Feature name is required.");
      return;
    }

    try {
      if (editingDoor) {
        await api.updateFakeDoor(editingDoor.id, {
          feature_name: featureName,
          feature_description: featureDesc,
          button_text: buttonText || "Notify Me",
        });
      } else {
        await api.createFakeDoor(featureName, featureDesc, buttonText || "Notify Me");
      }
      setShowModal(false);
      fetchFakeDoors();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save Fake Door");
    }
  };

  const handleToggleActive = async (door: FakeDoor) => {
    try {
      await api.updateFakeDoor(door.id, { is_active: !door.is_active });
      fetchFakeDoors();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this Fake Door? This cannot be undone.")) return;
    try {
      await api.deleteFakeDoor(id);
      fetchFakeDoors();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAnalyze = async (door: FakeDoor) => {
    if (user.plan === "free") {
      onNavigateTab("billing");
      return;
    }
    setAnalyzingId(door.id);
    try {
      await api.analyzeFakeDoor(door.id);
      fetchFakeDoors();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleTestClick = async (doorId: string) => {
    try {
      await api.recordFakeDoorClick(doorId, "I'd pay extra for this feature!");
      fetchFakeDoors();
    } catch (e: any) {
      console.error(e);
    }
  };

  const getEmbedSnippet = (doorId: string, text: string) => {
    return `<button onclick="fetch('${window.location.origin}/api/fake-doors/${doorId}/clicks', {method:'POST'})">${text}</button>`;
  };

  const copyEmbed = (doorId: string, text: string) => {
    navigator.clipboard.writeText(getEmbedSnippet(doorId, text));
    setCopiedId(doorId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 font-figtree text-[#E0D8D0]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-garamond text-4xl text-[#E0D8D0] font-light">Fake Doors</h1>
          <p className="text-xs text-[#9e968d] mt-1 max-w-xl">
            Test feature ideas before you build them. Add a button in your app, see who clicks, and let AI tell you if it's worth building.
          </p>
        </div>

        {isCapReached ? (
          <div className="p-3 bg-amber-500/10 text-amber-300 text-xs rounded-2xl border border-amber-500/30 flex items-center gap-2">
            <span>Fake Door cap reached ({activeCount}/{activeCaps[user.plan]} active)</span>
            <button
              onClick={() => onNavigateTab("billing")}
              className="font-semibold underline text-white cursor-pointer"
            >
              Upgrade
            </button>
          </div>
        ) : (
          <button
            onClick={openCreateModal}
            className="btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Fake Door</span>
          </button>
        )}
      </div>

      {/* List or Empty State */}
      {fakeDoors.length === 0 ? (
        <div className="card-cream text-center py-16 space-y-4 border border-white/15">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-[#E0D8D0]">
            <Sparkles className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="font-garamond text-3xl text-[#E0D8D0] font-light">No Fake Doors created yet</h3>
          <p className="text-xs text-[#9e968d] max-w-md mx-auto leading-relaxed">
            Start by naming a feature idea you're considering — we'll give you an embeddable button to test real demand.
          </p>
          <button
            onClick={openCreateModal}
            className="btn-primary px-6 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Fake Door</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {fakeDoors.map((door) => {
            const isCopied = copiedId === door.id;
            return (
              <div
                key={door.id}
                className={`card-cream border border-white/15 p-6 space-y-5 transition-all bg-[#0d0d0f] ${
                  !door.is_active ? "opacity-60" : ""
                }`}
              >
                {/* Top Door Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-garamond text-2xl text-[#E0D8D0] font-light">{door.feature_name}</h3>
                      <span
                        className={`text-[10px] font-sans uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${
                          door.is_active
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-white/10 text-white/60 border-white/15"
                        }`}
                      >
                        {door.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {door.feature_description && (
                      <p className="text-xs text-[#9e968d] mt-1">{door.feature_description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Click Stats */}
                    <div className="bg-[#000000] text-[#E0D8D0] px-4 py-2 rounded-2xl text-center border border-white/15">
                      <span className="font-garamond text-2xl font-light text-emerald-400 block">
                        {door.total_clicks}
                      </span>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-[#9e968d]">
                        Clicks
                      </span>
                    </div>

                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(door)}
                      className="text-white/60 hover:text-white cursor-pointer"
                      title={door.is_active ? "Pause test" : "Activate test"}
                    >
                      {door.is_active ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-white/30" />
                      )}
                    </button>

                    <button
                      onClick={() => openEditModal(door)}
                      className="p-2 hover:bg-white/10 rounded-lg cursor-pointer text-white/80"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(door.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg cursor-pointer text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Embed Snippet Generator */}
                <div className="bg-[#000000] text-[#E0D8D0] p-4 rounded-2xl border border-white/15 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#9e968d]">
                    <span>Button Embed Snippet</span>
                    <button
                      onClick={() => handleTestClick(door.id)}
                      className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <MousePointerClick className="w-3.5 h-3.5" />
                      Test Click Button
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white/80 flex items-center justify-between gap-4 overflow-x-auto">
                    <code>{getEmbedSnippet(door.id, door.button_text)}</code>
                    <button
                      onClick={() => copyEmbed(door.id, door.button_text)}
                      className="btn-primary px-3 py-1 text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer font-sans"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* AI Sentiment Analysis Box */}
                <div className="p-4 bg-[#000000] border border-white/15 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> AI Demand & Sentiment Analysis
                    </span>

                    {user.plan === "free" ? (
                      <button
                        onClick={() => onNavigateTab("billing")}
                        className="btn-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Upgrade to Basic for AI sentiment</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAnalyze(door)}
                        disabled={analyzingId === door.id}
                        className="btn-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        {analyzingId === door.id ? "Analyzing..." : "Analyze Sentiment"}
                      </button>
                    )}
                  </div>

                  {door.sentiment_score !== null ? (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-garamond text-3xl font-light text-emerald-400">
                          {door.sentiment_score}/100
                        </span>
                        <span className="text-[10px] font-sans uppercase tracking-widest text-[#E0D8D0] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                          Demand Rating
                        </span>
                      </div>
                      <p className="text-xs text-[#9e968d] font-figtree">{door.sentiment_summary}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#9e968d] pt-1">
                      {user.plan === "free"
                        ? "AI sentiment scoring is locked on the Free plan."
                        : "Click 'Analyze Sentiment' above to run AI sentiment analysis on recorded clicks and feedback."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-cream max-w-lg w-full border border-white/20 p-8 space-y-6 bg-[#0e0e11] shadow-2xl">
            <h2 className="font-garamond text-3xl text-[#E0D8D0] font-light">
              {editingDoor ? "Edit Fake Door" : "Create New Fake Door"}
            </h2>

            {errorMsg && (
              <div className="p-3 bg-amber-500/10 text-amber-300 text-xs rounded-xl border border-amber-500/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-figtree">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-[#E0D8D0] mb-1.5">
                  Feature Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dark Mode Theme"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#000000] border border-white/15 rounded-xl text-xs text-[#E0D8D0] placeholder-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-[#E0D8D0] mb-1.5">
                  Feature Description (Optional)
                </label>
                <textarea
                  placeholder="e.g. A dark color theme for late night coding"
                  value={featureDesc}
                  onChange={(e) => setFeatureDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#000000] border border-white/15 rounded-xl text-xs text-[#E0D8D0] placeholder-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-[#E0D8D0] mb-1.5">
                  Button Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Defaults to 'Notify Me'"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#000000] border border-white/15 rounded-xl text-xs text-[#E0D8D0] placeholder-white/20 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {editingDoor ? "Save Changes" : "Create Fake Door"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
