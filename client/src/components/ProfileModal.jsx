import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Check,
  Edit3,
  Save,
  ShieldCheck,
  Layout,
  Copy,
  Sparkles,
  Plus,
} from "lucide-react";
import { api } from "../api.js";

function formatDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfileModal({ user: rawUser, onUpdateUser, onLogout, onClose, notesCount = 0 }) {
  // Normalize user object if nested
  const user = rawUser?.user || rawUser || {};

  const [activeTab, setActiveTab] = useState("view"); // "view" | "edit"
  const [copiedKey, setCopiedKey] = useState(null);

  // Edit form state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [company, setCompany] = useState(user?.company || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.email ? user.email.split("@")[0] : "Notely User");

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const headline = [user?.jobTitle, user?.company].filter(Boolean).join(" at ") || "Notely Member";
  const memberSince = formatDate(user?.createdAt) || "Recently Joined";

  const handleCopy = (key, value) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const res = await api.updateProfile({
        firstName,
        lastName,
        phone,
        company,
        jobTitle,
      });
      if (res?.user) {
        onUpdateUser(res.user);
        setEditSuccess(true);
        setTimeout(() => {
          setEditSuccess(false);
          setActiveTab("view");
        }, 900);
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div
        className="wb-modal-card profile-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Ambient Gradient Background */}
        <div className="profile-card__header">
          <button
            type="button"
            className="profile-card__close"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X size={17} />
          </button>

          <div className="profile-card__hero">
            <div className="profile-card__avatar">
              <span>{initials}</span>
              <div className="profile-card__avatar-badge" title="Active Account">
                <Sparkles size={11} />
              </div>
            </div>

            <div className="profile-card__title-block">
              <div className="profile-card__name-row">
                <h2>{fullName}</h2>
                <span className="profile-card__verified-badge">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <p className="profile-card__headline">{headline}</p>
              {user?.email && (
                <div className="profile-card__email-pill">
                  <Mail size={12} />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Segment */}
        <div className="profile-card__nav-wrap">
          <div className="profile-card__nav-segment">
            <button
              type="button"
              className={`profile-card__nav-btn ${activeTab === "view" ? "is-active" : ""}`}
              onClick={() => setActiveTab("view")}
            >
              <User size={14} />
              <span>Personal Details</span>
            </button>
            <button
              type="button"
              className={`profile-card__nav-btn ${activeTab === "edit" ? "is-active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="profile-card__body">
          {/* TAB 1: VIEW DETAILS */}
          {activeTab === "view" && (
            <div className="profile-card__view-pane">
              {/* Quick Stat Tiles */}
              <div className="profile-card__stats">
                <div className="profile-card__stat-tile">
                  <div className="profile-card__stat-icon" style={{ color: "var(--color-accent)", background: "var(--color-accent-soft)" }}>
                    <Layout size={18} />
                  </div>
                  <div className="profile-card__stat-info">
                    <span className="profile-card__stat-val">{user?.notesCount ?? notesCount}</span>
                    <span className="profile-card__stat-lbl">Whiteboards Created</span>
                  </div>
                </div>

                <div className="profile-card__stat-tile">
                  <div className="profile-card__stat-icon" style={{ color: "var(--color-success)", background: "var(--color-success-soft)" }}>
                    <Calendar size={18} />
                  </div>
                  <div className="profile-card__stat-info">
                    <span className="profile-card__stat-val">{memberSince}</span>
                    <span className="profile-card__stat-lbl">Member Since</span>
                  </div>
                </div>
              </div>

              {/* Grouped Information List */}
              <div className="profile-card__section">
                <div className="profile-card__section-head">
                  <span>Account Information</span>
                  <button
                    type="button"
                    className="profile-card__edit-link"
                    onClick={() => setActiveTab("edit")}
                  >
                    <Edit3 size={12} />
                    <span>Edit details</span>
                  </button>
                </div>

                <div className="profile-card__detail-rows">
                  <div className="profile-card__detail-row">
                    <div className="profile-card__detail-key">
                      <User size={15} />
                      <span>Full Name</span>
                    </div>
                    <div className="profile-card__detail-val">
                      {fullName}
                    </div>
                  </div>

                  <div className="profile-card__detail-row">
                    <div className="profile-card__detail-key">
                      <Mail size={15} />
                      <span>Email address</span>
                    </div>
                    <div className="profile-card__detail-val">
                      <span>{user?.email || "No email on record"}</span>
                      {user?.email && (
                        <button
                          type="button"
                          className="profile-card__copy-btn"
                          onClick={() => handleCopy("email", user.email)}
                          title="Copy email"
                        >
                          {copiedKey === "email" ? (
                            <Check size={13} color="var(--color-success)" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="profile-card__detail-row">
                    <div className="profile-card__detail-key">
                      <Phone size={15} />
                      <span>Phone number</span>
                    </div>
                    <div className="profile-card__detail-val">
                      {user?.phone ? (
                        <span>{user.phone}</span>
                      ) : (
                        <button
                          type="button"
                          className="profile-card__add-btn"
                          onClick={() => setActiveTab("edit")}
                        >
                          <Plus size={12} /> Add phone
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="profile-card__detail-row">
                    <div className="profile-card__detail-key">
                      <Building2 size={15} />
                      <span>Company</span>
                    </div>
                    <div className="profile-card__detail-val">
                      {user?.company ? (
                        <span>{user.company}</span>
                      ) : (
                        <button
                          type="button"
                          className="profile-card__add-btn"
                          onClick={() => setActiveTab("edit")}
                        >
                          <Plus size={12} /> Add company
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="profile-card__detail-row">
                    <div className="profile-card__detail-key">
                      <Briefcase size={15} />
                      <span>Job title</span>
                    </div>
                    <div className="profile-card__detail-val">
                      {user?.jobTitle ? (
                        <span>{user.jobTitle}</span>
                      ) : (
                        <button
                          type="button"
                          className="profile-card__add-btn"
                          onClick={() => setActiveTab("edit")}
                        >
                          <Plus size={12} /> Add title
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "edit" && (
            <form className="profile-card__form" onSubmit={handleSaveProfile}>
              {editError && (
                <div className="auth-error">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="profile-card__success-banner">
                  <Check size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="profile-card__form-grid">
                <label className="profile-card__form-group">
                  <span>First name</span>
                  <div className="profile-card__input-shell">
                    <User size={15} className="profile-card__input-icon" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                </label>

                <label className="profile-card__form-group">
                  <span>Last name</span>
                  <div className="profile-card__input-shell">
                    <User size={15} className="profile-card__input-icon" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </label>

                <label className="profile-card__form-group">
                  <span>Job title</span>
                  <div className="profile-card__input-shell">
                    <Briefcase size={15} className="profile-card__input-icon" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Product Designer"
                    />
                  </div>
                </label>

                <label className="profile-card__form-group">
                  <span>Company</span>
                  <div className="profile-card__input-shell">
                    <Building2 size={15} className="profile-card__input-icon" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Inc."
                    />
                  </div>
                </label>

                <label className="profile-card__form-group" style={{ gridColumn: "1 / -1" }}>
                  <span>Phone number</span>
                  <div className="profile-card__input-shell">
                    <Phone size={15} className="profile-card__input-icon" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </label>
              </div>

              <div className="profile-card__form-footer">
                <button
                  type="button"
                  className="profile-card__btn-ghost"
                  onClick={() => {
                    setFirstName(user?.firstName || "");
                    setLastName(user?.lastName || "");
                    setPhone(user?.phone || "");
                    setCompany(user?.company || "");
                    setJobTitle(user?.jobTitle || "");
                    setActiveTab("view");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-card__btn-primary"
                  disabled={saving}
                >
                  <Save size={15} />
                  <span>{saving ? "Saving Changes…" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card Footer */}
        <div className="profile-card__footer">
          <div className="profile-card__session">
            <span className="sidebar__foot-dot" />
            <span>Active Session</span>
          </div>
          <button
            type="button"
            className="profile-card__signout"
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
