import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Timer, 
  Shield, 
  BarChart3, 
  Trophy, 
  Lock, 
  Zap, 
  Users,
  Monitor,
  CheckCircle,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Particles from '@/components/Particles';

const Features = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Write code in C, C++, Python, Java, HTML, CSS, JavaScript and more",
      details: ["Syntax highlighting", "Auto-completion", "Error detection", "Real-time compilation"]
    },
    {
      icon: Timer,
      title: "Smart Time Management",
      description: "Advanced timer with automatic submission and time warnings",
      details: ["Countdown timer", "Auto-save progress", "Time alerts", "Automatic submission"]
    },
    {
      icon: Shield,
      title: "Anti-Cheat Security",
      description: "Comprehensive security measures to ensure exam integrity",
      details: ["Screen lock", "Tab monitoring", "Copy-paste detection", "Webcam proctoring"]
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "In-depth performance analysis and personalized feedback",
      details: ["Code efficiency metrics", "Speed analysis", "Problem-solving patterns", "Improvement suggestions"]
    }
  ];

  const advancedFeatures = [
    {
      icon: Lock,
      title: "Secure Environment",
      description: "Locked browser mode prevents switching applications"
    },
    {
      icon: Zap,
      title: "Real-time Compilation",
      description: "Instant code execution and output preview"
    },
    {
      icon: Users,
      title: "Collaborative Grading",
      description: "Advanced AI-assisted grading with human oversight"
    },
    {
      icon: Monitor,
      title: "Live Monitoring",
      description: "Real-time exam monitoring and suspicious activity detection"
    },
    {
      icon: CheckCircle,
      title: "Auto-Save",
      description: "Continuous saving prevents data loss"
    },
    {
      icon: Cpu,
      title: "Performance Metrics",
      description: "Code complexity and optimization analysis"
    }
  ];

  const languages = [
    { name: "C", color: "bg-blue-500" },
    { name: "C++", color: "bg-blue-600" },
    { name: "Python", color: "bg-yellow-500" },
    { name: "Java", color: "bg-red-500" },
    { name: "JavaScript", color: "bg-yellow-400" },
    { name: "HTML", color: "bg-orange-500" },
    { name: "CSS", color: "bg-blue-400" },
    { name: "SQL", color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen">
      <Particles />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Powerful Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the cutting-edge capabilities that make CodeLab the most advanced 
            coding examination platform in the industry.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported Languages</h2>
            <p className="text-muted-foreground">
              Code in your preferred programming language with full IDE support
            </p>
          </div>
          
          <Card className="glass-card">
            <CardContent className="py-8">
              <div className="flex flex-wrap justify-center gap-4">
                {languages.map((lang, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-4 py-2 text-lg font-semibold bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {lang.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Advanced Capabilities</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-transform duration-300">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Focus */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-destructive/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Security First</CardTitle>
              <CardDescription>
                Our comprehensive anti-cheat system ensures complete exam integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">Prevention Measures</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Browser lockdown mode</li>
                    <li>• Application switching detection</li>
                    <li>• Copy-paste monitoring</li>
                    <li>• Network activity tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">Detection Systems</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Suspicious behavior alerts</li>
                    <li>• Pattern recognition AI</li>
                    <li>• Real-time monitoring</li>
                    <li>• Automated reporting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Experience CodeLab?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students and educators who trust CodeLab for their coding assessments.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/login')} className="neon-button">
              <Trophy className="h-4 w-4 mr-2" />
              Start Examination
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/about')}
              className="border-primary/20 hover:border-primary/40"
            >
              Learn More
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

export default Features;