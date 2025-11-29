import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useFirebaseAuth } from '@/lib/firebase-auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Calendar, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AddMemoryDialog } from '@/components/AddMemoryDialog';
interface Trip {
  id: string;
  user_id: string;
  location: string;
  date: string;
  category: string;
  created_at?: string;
}

interface Memory {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  description?: string;
  photo_url?: string;
  tags?: string[];
  date: string;
  created_at?: string;
}

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTripAndMemories();
    }
  }, [id, user]);

  const fetchTripAndMemories = async () => {
    if (!user || !id) return;
  
    try {
      // Fetch the trip
      const tripsRef = collection(db, 'trips');
      const tripQuery = query(tripsRef, where('user_id', '==', user.uid));
      const tripSnapshot = await getDocs(tripQuery);
      
      const tripDoc = tripSnapshot.docs.find(doc => doc.id === id);
      if (!tripDoc) {
        toast({
          title: 'Error',
          description: 'Trip not found',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }
  
      setTrip({ id: tripDoc.id, ...tripDoc.data() } as Trip);
  
      // Fetch memories for this trip
      const memoriesRef = collection(db, 'memories');
      const memoriesQuery = query(
        memoriesRef,
        where('trip_id', '==', id)
        //orderBy('date', 'desc')
      );
      const memoriesSnapshot = await getDocs(memoriesQuery);
      console.log('🎯 Raw memory docs:', memoriesSnapshot.docs.map(d => d.data()));
      console.log('🎯 Number of memories found:', memoriesSnapshot.docs.length);

      const memoriesData = memoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Memory[];
  
      setMemories(memoriesData);
    } catch (error: any) {
      console.error('❌ TripDetail error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      toast({
        title: 'Error',
        description: 'Failed to load trip details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await deleteDoc(doc(db, 'memories', memoryId));
      toast({ title: 'Memory deleted' });
      fetchTripAndMemories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete memory',
        variant: 'destructive',
      });
    }
  };
  

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <AddMemoryDialog tripId={trip.id} onMemoryAdded={fetchTripAndMemories} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Trip Info */}
        <div className="mb-8 space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg">
              {trip.category}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">{trip.location}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {new Date(trip.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Memories Grid */}
        {memories.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">No memories yet. Add your first memory!</p>
              <AddMemoryDialog tripId={trip.id} onMemoryAdded={fetchTripAndMemories} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <Card
                key={memory.id}
                className="overflow-hidden hover:shadow-lg transition-all group animate-slide-up"
              >
                {memory.photo_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={memory.photo_url}
                      alt={memory.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
                  {memory.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">{memory.description}</p>
                  )}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(memory.date).toLocaleDateString()}
                    </p>
                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {memory.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMemory(memory.id)}
                  >
                    Delete Memory
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TripDetail;
