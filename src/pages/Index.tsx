import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-travel.jpg';
import { Plane, MapPin, Camera, Tag } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Travel destinations"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <Plane className="h-12 w-12" />
            <h1 className="text-6xl font-bold">Wanderlog</h1>
          </div>
          <p className="text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Your personal travel journal. Document memories, save places, and keep your adventures alive forever.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Everything you need to remember</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-slide-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Organize by Location</h3>
              <p className="text-muted-foreground">
                Group your trips by destination and easily find all memories from your favorite places.
              </p>
            </div>
            <div className="text-center space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Photo Memories</h3>
              <p className="text-muted-foreground">
                Upload photos and add descriptions to create a visual diary of your travels.
              </p>
            </div>
            <div className="text-center space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Tag & Categorize</h3>
              <p className="text-muted-foreground">
                Use tags to mark places for future visits and categorize trips by type.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start documenting?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join Wanderlog today and never forget a travel moment again.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="text-lg px-8"
          >
            Create Your Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
