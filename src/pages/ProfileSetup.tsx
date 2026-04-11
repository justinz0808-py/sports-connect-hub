import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const SPORTS = [
  "Basketball",
  "Football",
  "Soccer",
  "Baseball",
  "Track & Field",
  "Volleyball",
  "Swimming",
  "Tennis",
  "Golf",
  "Lacrosse",
  "Wrestling",
  "Other",
];

const GRAD_YEARS = Array.from({ length: 10 }, (_, i) =>
  String(new Date().getFullYear() + i)
);

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Step 1 — Basic Info
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [userType, setUserType] = useState("athlete");

  // Step 2 — Athlete fields
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 2 — Coach-specific fields
  const [coachingLevel, setCoachingLevel] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      // If the user already has a username, their profile is set up — skip to feed
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profile?.username) {
        navigate("/feed", { replace: true });
        return;
      }
      setUser(user);
      const meta = user.user_metadata ?? {};
      if (meta.full_name) setDisplayName(meta.full_name);
      if (meta.sport) setSport(meta.sport.toLowerCase());
      if (meta.user_type) setUserType(meta.user_type);
      setIsLoading(false);
    });
  }, [navigate]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Display name is required";
    if (!username.trim()) e.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      e.username = "3–20 characters, letters/numbers/underscores only";
    if (bio.length > 160) e.bio = "Bio must be 160 characters or fewer";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!sport) e.sport = userType === "coach" ? "Select your sport specialty" : "Select your sport";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validateStep2()) return;
    setIsSaving(true);

    let avatar_url: string | undefined;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("Avatar")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        toast({ title: "Avatar upload failed", description: uploadError.message, variant: "destructive" });
        setIsSaving(false);
        return;
      }
      avatar_url = supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        full_name: displayName,
        bio,
        location,
        sport,
        user_type: userType,
        position: userType !== "coach" ? position : null,
        school,
        grad_year: userType !== "coach" && gradYear ? parseInt(gradYear) : null,
        height: userType !== "coach" ? height : null,
        weight: userType !== "coach" ? weight : null,
        ...(userType === "coach" && coachingLevel ? { coaching_level: coachingLevel } : {}),
        ...(avatar_url ? { avatar_url } : {}),
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Couldn't save profile",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    navigate("/feed");
  };

  const inputCls = (field: string) =>
    `h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground ${
      errors[field] ? "border-destructive ring-1 ring-destructive" : ""
    }`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[390px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl text-foreground tracking-wide">THE LOCKER ROOM</h1>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                <div
                  className={`h-px flex-1 transition-colors ${
                    s < step ? "bg-primary" : "bg-border"
                  }`}
                />
              </div>
            ))}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                step === 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              3
            </div>
          </div>
        )}

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-foreground mb-1">Basic Info</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Tell the community who you are.
            </p>

            <div className="space-y-4">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-secondary border-2 border-border flex items-center justify-center overflow-hidden active:scale-[0.97] transition-transform"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
                <p className="text-xs text-muted-foreground">Tap to add photo</p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Display Name</Label>
                <Input
                  placeholder="Your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputCls("displayName")}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    placeholder="yourhandle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    className={`${inputCls("username")} pl-7`}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">I am a...</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="h-11 bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="athlete">Athlete</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Bio</Label>
                  <span
                    className={`text-xs ${
                      bio.length > 160 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {bio.length}/160
                  </span>
                </div>
                <Textarea
                  placeholder="A short bio about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none ${
                    errors.bio ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Location</Label>
                <Input
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputCls("location")}
                />
              </div>
            </div>

            <Button
              className="w-full h-11 mt-6 text-base font-semibold gap-2"
              onClick={handleNext}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* ── Step 2: Athletic / Coaching Info ── */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {userType === "coach" ? "Coaching Info" : "Athletic Info"}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {userType === "coach" ? "Share your coaching background." : "Share your sport and stats."}
            </p>

            <div className="space-y-4">
              {/* Sport — shown for all roles */}
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">
                  {userType === "coach" ? "Sport Specialty" : "Sport"}
                </Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger
                    className={`h-11 bg-secondary border-border text-foreground ${
                      errors.sport ? "border-destructive ring-1 ring-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder={userType === "coach" ? "Select sport specialty" : "Select your sport"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {SPORTS.map((s) => (
                      <SelectItem key={s} value={s.toLowerCase()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sport && (
                  <p className="text-xs text-destructive">{errors.sport}</p>
                )}
              </div>

              {/* Athlete-only fields */}
              {userType !== "coach" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Position</Label>
                    <Input
                      placeholder="e.g. Point Guard, Quarterback"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className={inputCls("position")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">School</Label>
                    <Input
                      placeholder="School or university name"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className={inputCls("school")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Graduation Year</Label>
                    <Select value={gradYear} onValueChange={setGradYear}>
                      <SelectTrigger className="h-11 bg-secondary border-border text-foreground">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {GRAD_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Height</Label>
                      <Input
                        placeholder={`e.g. 6'2"`}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className={inputCls("height")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Weight</Label>
                      <Input
                        placeholder="e.g. 185 lbs"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={inputCls("weight")}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Coach-only fields */}
              {userType === "coach" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">School / Organization</Label>
                    <Input
                      placeholder="School or organization name"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className={inputCls("school")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Coaching Level</Label>
                    <Select value={coachingLevel} onValueChange={setCoachingLevel}>
                      <SelectTrigger className="h-11 bg-secondary border-border text-foreground">
                        <SelectValue placeholder="Select coaching level" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 h-11 gap-2"
                onClick={handleBack}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-1 h-11 text-base font-semibold gap-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Save <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Your profile is ready!
            </h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs">
              Welcome to The Locker Room,{" "}
              <span className="text-foreground font-medium">{displayName}</span>.
              Start connecting with athletes, coaches, and recruiters.
            </p>
            <Button
              className="w-full h-11 text-base font-semibold"
              onClick={() => navigate("/feed")}
            >
              Go to Feed
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
