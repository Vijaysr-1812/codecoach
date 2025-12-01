import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Target, Shield, Zap, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Particles from '@/components/Particles';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Precision Testing",
      description: "Advanced algorithms to evaluate coding skills with pinpoint accuracy"
    },
    {
      icon: Shield,
      title: "Secure Environment",
      description: "Completely secure examination environment with anti-cheat mechanisms"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Instant performance feedback and detailed analytics"
    },
    {
      icon: Users,
      title: "Multi-language Support",
      description: "Support for C, C++, Python, Java, HTML and more"
    }
  ];

  return (
    <div className="min-h-screen">
      <Particles />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <Code className="h-16 w-16 text-primary animate-pulse pulse-neon" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            About CodeLab
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The next-generation coding examination platform designed to revolutionize 
            how programming skills are assessed in the digital age.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-card mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Our Mission</CardTitle>
              <CardDescription className="text-lg">
                Empowering educators and students with cutting-edge technology
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg leading-relaxed text-muted-foreground">
                CodeLab bridges the gap between traditional assessment methods and modern 
                programming education. We provide a comprehensive platform that not only 
                tests coding abilities but also analyzes problem-solving patterns, code 
                efficiency, and programming best practices.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <Card className="glass-card">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-muted-foreground">Students Tested</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">500+</div>
                  <div className="text-muted-foreground">Educational Institutions</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Built by Innovators
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team combines decades of experience in education technology, 
            software engineering, and data science to create the most advanced 
            coding assessment platform available today.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/features')} className="neon-button">
              <Trophy className="h-4 w-4 mr-2" />
              Explore Features
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-primary/20 hover:border-primary/40"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-primary"
          >
            ← Back to Home
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;