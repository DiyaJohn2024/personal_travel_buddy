import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, MapPin, Calendar, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AddTripDialog } from '@/components/AddTripDialog';
import { EditTripDialog } from '@/components/EditTripDialog';
import type { Database } from '@/integrations/supabase/types';

type Trip = Database['public']['Tables']['trips']['Row'];
type Memory = Database['public']['Tables']['memories']['Row'];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMemories, setAllMemories] = useState<Memory[]>([]);

  const categories = ['Beach', 'Mountains', 'City', 'Adventure', 'Cultural', 'Nature'];

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;
  
    // Fetch trips (existing code)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
  
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load trips',
        variant: 'destructive',
      });
    } else {
      setTrips(data || []);
    }
  
    // NEW: Fetch ALL memories for "places to visit"
    const { data: memoriesData, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
  
    if (memoriesError) {
      toast({
        title: 'Error',
        description: 'Failed to load memories',
        variant: 'destructive',
      });
    } else {
      setAllMemories(memoriesData || []);
    }
  
    setLoading(false);
  };
  

  const handleDeleteTrip = async (tripId: string) => {
    const { error } = await supabase.from('trips').delete().eq('id', tripId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete trip',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Trip deleted' });
      fetchTrips();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredTrips = trips
  .filter((trip) =>
    selectedCategory ? trip.category === selectedCategory : true
  )
  .filter((trip) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return trip.location.toLowerCase().includes(term);
  });

  // Filter memories for "places to visit"
const placesToVisit = allMemories
.filter((memory) =>
  memory.tags?.some((tag) => 
    tag.toLowerCase().includes('future') || 
    tag.toLowerCase().includes('visit') ||
    tag.toLowerCase().includes('todo')
  )
)
.filter((memory) => {
  if (!searchTerm.trim()) return true;
  const term = searchTerm.toLowerCase();
  return (
    memory.title.toLowerCase().includes(term) ||
    memory.description?.toLowerCase().includes(term)
  );
});


  // Group trips by location
  const tripsByLocation = filteredTrips.reduce((acc, trip) => {
    const location = trip.location;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
    {/* Floating travel icons background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      <Plane className="absolute top-20 left-10 h-12 w-12 text-blue-400 animate-pulse" style={{animationDelay: '0s'}} />
      <MapPin className="absolute top-40 right-20 h-10 w-10 text-purple-400 animate-pulse" style={{animationDelay: '1s'}} />
      <Plane className="absolute bottom-40 left-1/4 h-14 w-14 text-pink-400 animate-pulse" style={{animationDelay: '2s'}} />
      <MapPin className="absolute bottom-20 right-1/3 h-8 w-8 text-blue-400 animate-pulse" style={{animationDelay: '1.5s'}} />
    </div>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Wanderlog</h1>
          <div className="flex items-center gap-4">
            <AddTripDialog onTripAdded={fetchTrips} categories={categories} />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        {/* Search + Category Filter */}
<div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Search bar */}
  <div className="w-full md:max-w-sm">
    <input
      type="text"
      placeholder="Search by place (e.g. Paris, Kyoto)..."
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Category Filter */}
  <div className="flex flex-wrap gap-2">
    <Badge
      variant={selectedCategory === null ? 'default' : 'outline'}
      className="cursor-pointer px-4 py-2 text-xs md:text-sm rounded-full font-medium tracking-wide"
      onClick={() => setSelectedCategory(null)}
    >
      All Trips
    </Badge>
    {categories.map((category) => (
      <Badge
        key={category}
        variant={selectedCategory === category ? 'default' : 'outline'}
        className="cursor-pointer px-4 py-2 text-xs md:text-sm rounded-full font-medium tracking-wide"
        onClick={() => setSelectedCategory(category)}
      >
        {category}
      </Badge>
    ))}
  </div>
</div>


        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredTrips.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">No trips yet. Start your travel journal!</p>
              <AddTripDialog onTripAdded={fetchTrips} categories={categories} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            <div className="space-y-12">
  {/* TRIPS SECTION - only show if there are filtered trips */}
  {Object.entries(tripsByLocation).length > 0 && (
    <>
      {Object.entries(tripsByLocation).map(([location, locationTrips]) => (
        <div key={location} className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            {location}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationTrips.map((trip) => (
              <Card
              key={trip.id}
              className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 hover:border-primary bg-white/90 backdrop-blur-sm"
              onClick={() => navigate(`/trip/${trip.id}`)}
            >
              <CardContent className="p-6 relative">
                {/* Top corner badge */}
                <div className="flex justify-between items-start mb-4">
                  <Badge className="text-sm px-3 py-1">{trip.category}</Badge>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTrip(trip);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
            
                {/* Location - bigger and bolder */}
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {trip.location}
                </h3>
            
                {/* Date */}
                <p className="text-muted-foreground flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4" />
                  {new Date(trip.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
            
                {/* Click hint - shows on hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-primary font-medium flex items-center gap-1">
                    View memories
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </CardContent>
            </Card>
            
            ))}
          </div>
        </div>
      ))}
    </>
  )}

  {/* PLACES TO VISIT SECTION - independent of trips */}
  {placesToVisit.length > 0 && (
    <div className="mt-16 pt-12 border-t">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <MapPin className="h-8 w-8 text-primary" />
        Places to Visit
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {placesToVisit.map((memory) => (
          <Card key={memory.id} className="overflow-hidden hover:shadow-lg transition-all group">
            {/* ... existing places to visit card content ... */}
          </Card>
        ))}
      </div>
    </div>
  )}
</div>

          </div>
        )}
      </main>

      {editingTrip && (
        <EditTripDialog
          trip={editingTrip}
          categories={categories}
          onClose={() => setEditingTrip(null)}
          onTripUpdated={fetchTrips}
        />
      )}
    </div>
  );
};

export default Dashboard;
