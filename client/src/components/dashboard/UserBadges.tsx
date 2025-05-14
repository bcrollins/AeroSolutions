import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  category: string; // "achievement", "milestone", "completion", etc.
}

interface UserBadgesProps {
  badges: Badge[];
}

export default function UserBadges({ badges }: UserBadgesProps) {
  // No badges state
  if (!badges.length) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">My Achievements</h2>
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <Award className="h-16 w-16 text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
              <p className="text-slate-400 max-w-md">
                Complete courses and challenges to earn achievement badges. Your accomplishments will be displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">My Achievements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <Card 
            key={badge.id} 
            className="bg-slate-800 border-slate-700 text-white overflow-hidden hover:border-blue-500 transition-all hover:scale-[1.05] duration-300"
          >
            <div className="flex flex-col items-center p-6">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-4 p-1 border-2 border-blue-500">
                {badge.iconUrl ? (
                  <img 
                    src={badge.iconUrl} 
                    alt={badge.name} 
                    className="w-16 h-16 object-contain" 
                  />
                ) : (
                  <Award className="w-10 h-10 text-blue-400" />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-center mb-1">{badge.name}</h3>
              <p className="text-sm text-slate-400 text-center">{badge.description}</p>
              
              <div className="mt-4 px-3 py-1 bg-slate-700 rounded-full text-xs text-blue-300">
                Earned on {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}