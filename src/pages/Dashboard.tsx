import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AddTripDialog } from '@/components/AddTripDialog';
import { EditTripDialog } from '@/components/EditTripDialog';
import type { Database } from '@/integrations/supabase/types';

type Trip = Database['public']['Tables']['trips']['Row'];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const categories = ['Beach', 'Mountains', 'City', 'Adventure', 'Cultural', 'Nature'];

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;

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

  const filteredTrips = selectedCategory
    ? trips.filter((trip) => trip.category === selectedCategory)
    : trips;

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
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
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All Trips
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
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
                      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => navigate(`/trip/${trip.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge>{trip.category}</Badge>
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
                        <h3 className="text-xl font-semibold mb-2">{trip.location}</h3>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(trip.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
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
