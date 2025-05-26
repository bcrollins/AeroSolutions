import { Link } from 'wouter';
import { Code, Database, Globe, Smartphone, Zap, Users, Award, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WebDevelopmentHub() {
  const learningPaths = [
    {
      title: "Frontend Development",
      description: "Master modern frontend technologies and frameworks",
      icon: <Globe className="w-8 h-8" />,
      skills: ["HTML5/CSS3", "JavaScript ES6+", "React", "TypeScript", "Tailwind CSS"],
      duration: "8-12 weeks",
      level: "Beginner to Advanced",
      href: "/web-dev/frontend"
    },
    {
      title: "Backend Development", 
      description: "Build powerful server-side applications and APIs",
      icon: <Database className="w-8 h-8" />,
      skills: ["Node.js", "Express", "PostgreSQL", "API Design", "Authentication"],
      duration: "10-14 weeks",
      level: "Intermediate",
      href: "/web-dev/backend"
    },
    {
      title: "Full-Stack Mastery",
      description: "Complete end-to-end web application development",
      icon: <Code className="w-8 h-8" />,
      skills: ["React", "Node.js", "Database Design", "DevOps", "Testing"],
      duration: "16-20 weeks",
      level: "Advanced",
      href: "/web-dev/fullstack"
    }
  ];

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Project-Based Learning",
      description: "Build real-world applications while learning"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Mentorship",
      description: "Get guidance from industry professionals"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Interactive Coding",
      description: "Hands-on practice with immediate feedback"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Industry Certificates",
      description: "Earn recognized credentials for your skills"
    }
  ];

  const technologies = [
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "TypeScript", category: "Language" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Next.js", category: "Framework" },
    { name: "Express", category: "Backend" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "MongoDB", category: "Database" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Badge className="px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-400/30">
              Web Development Training
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Modern
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 block">
              Web Development
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your career with comprehensive web development training. From frontend design to backend architecture, 
            master the technologies that power the modern web.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              asChild
            >
              <Link href="/web-dev/frontend">
                Start Learning Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
              asChild
            >
              <Link href="/course-catalog">
                View All Courses
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Learning Path</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Structured learning paths designed to take you from beginner to professional developer
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full w-fit group-hover:scale-110 transition-transform">
                    <div className="text-blue-400">
                      {path.icon}
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl mb-2">{path.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {path.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{path.duration}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{path.level}</span>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Key Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    asChild
                  >
                    <Link href={path.href}>
                      Start Path <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Web Development Training?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Industry-leading curriculum designed by professional developers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full w-fit group-hover:scale-110 transition-transform">
                  <div className="text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Master In-Demand Technologies</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Learn the tools and frameworks used by top companies worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="bg-gray-800/30 border-gray-700 text-center p-4 hover:bg-gray-800/50 transition-all duration-300">
                <CardContent className="p-0">
                  <h3 className="text-white font-semibold mb-1">{tech.name}</h3>
                  <p className="text-gray-400 text-sm">{tech.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Web Development Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who have transformed their careers with our comprehensive training programs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              asChild
            >
              <Link href="/web-dev/frontend">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
              asChild
            >
              <Link href="/contact">
                Talk to an Advisor
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}