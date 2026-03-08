import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/Loading';
import { useLandingColors } from '../landing/theme';
import { SkipAnimationProvider } from '../contexts/SkipAnimationContext';
import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  HighlightsSection,
  TrustedBySection,
  MembershipSection,
  TestimonialsSection,
  CTASection,
  LandingFooter,
} from '../landing/sections';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <Loading fullScreen message="Loading…" />;

  return (
    <SkipAnimationProvider>
      <LandingContent />
    </SkipAnimationProvider>
  );
}

function LandingContent() {
  const colors = useLandingColors();
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: colors.background }}>
      <LandingHeader colors={colors} />
      <HeroSection colors={colors} />
      <FeaturesSection colors={colors} />
      <HighlightsSection colors={colors} />
      <TrustedBySection colors={colors} />
      <MembershipSection colors={colors} />
      <TestimonialsSection colors={colors} />
      <CTASection colors={colors} />
      <LandingFooter colors={colors} />
    </div>
  );
}
