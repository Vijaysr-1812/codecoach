import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Zap, 
  Shield, 
  Trophy, 
  ArrowRight, 
  Play,
  Users,
  Timer,
  Target,
  Star
} from 'lucide-react';
import Particles from '@/components/Particles';
import { TerminalSquare } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Code in C, C++, Python, Java, HTML & more"
    },
    {
      icon: Shield,
      title: "Secure Environment",
      description: "Anti-cheat technology for fair assessment"
    },
    {
      icon: Timer,
      title: "Real-time Analysis",
      description: "Instant performance feedback & analytics"
    },
    {
      icon: Trophy,
      title: "Competitive Leaderboard",
      description: "Track your ranking among peers"
    }
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Students Tested" },
    { icon: Target, value: "99.9%", label: "Accuracy Rate" },
    { icon: Zap, value: "500+", label: "Institutions" },
    { icon: Star, value: "4.9", label: "Rating" }
  ];

  return (
    <div className="min-h-screen">
      <Particles />
      
      {/* Global Navbar is rendered by Layout */}

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge className="px-4 py-2 text-lg bg-primary/10 text-primary border-primary/20">
              🚀 Next-Gen Coding Platform
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent typing">
                CodeCoach
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The ultimate coding examination platform designed for the digital age. 
              Test your skills, compete with peers, and unlock your programming potential.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')} 
              className="neon-button text-lg px-8 py-4"
            >
              <Play className="h-5 w-5 mr-2" />
              Enter CodeLab
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/developers')} className="text-lg px-8 py-4 border-primary/20 hover:border-primary/40">
              <TerminalSquare className="h-5 w-5 mr-2" />
              Developer Terminal
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card text-center hover:scale-105 transition-transform duration-300">
                <CardContent className="py-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for comprehensive coding assessment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-all duration-300 group">
                <CardHeader>
                  <div className="p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card overflow-hidden">
            <CardContent className="py-12 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Ready to Test Your Skills?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of students who have already experienced the future of coding assessment.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="neon-button text-lg px-8 py-4"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Begin Your Journey
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/leaderboard')}
                  className="text-lg px-8 py-4 border-primary/20 hover:border-primary/40"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Global Footer is rendered by Layout */}
    </div>
  );
};

export default Index;
