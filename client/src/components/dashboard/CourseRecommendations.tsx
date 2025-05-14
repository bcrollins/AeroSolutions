import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface CourseRecommendation {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  difficulty: string;
  reasonForRecommendation: string;
}

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[];
}

export default function CourseRecommendations({ recommendations }: CourseRecommendationsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle scrolling in the carousel
  const scrollToIndex = (index: number) => {
    const container = carouselRef.current;
    if (container) {
      const cards = container.querySelectorAll('.recommendation-card');
      if (cards.length > 0 && index >= 0 && index < cards.length) {
        const card = cards[index] as HTMLElement;
        container.scrollTo({
          left: card.offsetLeft - container.offsetLeft,
          behavior: 'smooth',
        });
        setCurrentIndex(index);
      }
    }
  };

  const nextSlide = () => {
    const newIndex = Math.min(currentIndex + 1, recommendations.length - 1);
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    scrollToIndex(newIndex);
  };

  // No recommendations state
  if (!recommendations.length) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Recommended for You</h2>
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="h-16 w-16 text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
              <p className="text-slate-400 max-w-md">
                Complete more courses or explore our catalog to get personalized recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 text-blue-400" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={currentIndex === recommendations.length - 1}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4 text-blue-400" />
          </Button>
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="flex overflow-x-auto pb-4 space-x-6 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((course, index) => (
          <Card 
            key={course.id} 
            className={`recommendation-card flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-slate-800 border-slate-700 text-white overflow-hidden hover:border-blue-500 transition-all hover:scale-[1.05] duration-300 snap-start ${
              index === currentIndex ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={course.thumbnail || "https://placehold.co/600x400/1a1a1a/007bff?text=Course"} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70"></div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-blue-900/60 text-white border-blue-700">
                  {course.difficulty}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="text-slate-400 line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-blue-400 italic">
                  "{course.reasonForRecommendation}"
                </p>
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <span className="mr-4">
                  <span className="mr-1">⏱️</span> {course.duration}
                </span>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                asChild
              >
                <a href={`/ai-courses/${course.id}`}>View Course</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Mobile pagination indicators */}
      <div className="flex justify-center space-x-2 mt-4 md:hidden">
        {recommendations.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-4 bg-blue-500' : 'w-2 bg-slate-700'
            }`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}