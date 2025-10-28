import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Brain, 
  Server, 
  Code, 
  Cloud, 
  Palette,
  ArrowLeft,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import Particles from '@/components/Particles';

const Developers = () => {
  const navigate = useNavigate();

  const getDeveloperLinkedIn = (name: string) => {
    const links = {
      "Preetham AK": "https://www.linkedin.com/in/preetham-a-k-18b97931b",
      "Bhuvan Bhat": "https://www.linkedin.com/in/bhuvan-bhat-313b1b371",
      "Madan Kumar G S": "https://www.linkedin.com/in/madan-kumar-g-s-a61892321",
      "Harshvardhan Goriya": "https://www.linkedin.com/in/harshavardhan-goriya-9953ab317",
      "Brundha": "https://www.linkedin.com/in/sai-brundha-karanam-bb0a22344",
      "Parinitha": "https://www.linkedin.com/in/parinitha-n-085115332"
    };
    return links[name as keyof typeof links] || "#";
  };

  const getDeveloperGithub = (name: string) => {
    const links = {
      "Preetham AK": "https://github.com/preethamak",
      "Bhuvan Bhat": "https://github.com/bhuvan744",
      "Madan Kumar G S": "https://github.com/madan1432",
      "Harshvardhan Goriya": "https://github.com/GoriyaHarshavardhan",
      "Brundha": "https://github.com/Saibrundha3",
      "Parinitha": "https://github.com/ParinithaN1506"
    };
    return links[name as keyof typeof links] || "#";
  };

  const developers = [
    {
      name: "Preetham AK",
      role: "AI Developer",
      icon: Brain,
      description: "Specializes in machine learning algorithms and AI-powered features for intelligent code assessment and automated grading systems.",
      skills: ["Machine Learning", "TensorFlow", "Python", "Neural Networks", "NLP"],
      color: "bg-purple-500/10 text-purple-500",
      avatar: "P"
    },
    {
      name: "Bhuvan Bhat",
      role: "Backend Engineer",
      icon: Server,
      description: "Architecting robust server infrastructure and APIs that power the examination platform's core functionality and data management.",
      skills: ["Node.js", "MongoDB", "REST APIs", "Microservices", "Redis"],
      color: "bg-blue-500/10 text-blue-500",
      avatar: "B"
    },
    {
      name: "Madan Kumar G S",
      role: "Fullstack Software Engineer",
      icon: Code,
      description: "Building end-to-end solutions, bridging frontend and backend technologies to create seamless user experiences.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      color: "bg-green-500/10 text-green-500",
      avatar: "M"
    },
    {
      name: "Harshvardhan Goriya",
      role: "Cloud Engineer",
      icon: Cloud,
      description: "Managing cloud infrastructure and DevOps pipelines to ensure scalable, secure, and high-performance deployment solutions.",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      color: "bg-orange-500/10 text-orange-500",
      avatar: "H"
    },
    {
      name: "Brundha",
      role: "Frontend Developer",
      icon: Palette,
      description: "Crafting beautiful and intuitive user interfaces with modern design principles and responsive web technologies.",
      skills: ["React", "CSS3", "JavaScript", "UI/UX", "Responsive Design"],
      color: "bg-pink-500/10 text-pink-500",
      avatar: "B"
    },
    {
      name: "Parinitha",
      role: "Frontend Developer",
      icon: Palette,
      description: "Creating engaging user experiences through innovative frontend solutions and interactive web components.",
      skills: ["Vue.js", "HTML5", "SASS", "Animation", "Accessibility"],
      color: "bg-cyan-500/10 text-cyan-500",
      avatar: "P"
    },
    {
      name: "VIJAY S R",
      role: "Frontend Developer",
      icon: Palette,
      description: "Creating engaging user experiences through innovative frontend solutions and interactive web components.",
      skills: ["Vue.js", "HTML5", "SASS", "Animation", "Accessibility"],
      color: "bg-cyan-500/10 text-cyan-500",
      avatar: "V"
    },
    {
      name: "Keshav Sharma",
      role: "Frontend Developer",
      icon: Cloud,
      description: "Creating engaging user experiences through innovative frontend solutions and interactive web components.",
      skills: ["Vue.js", "HTML5", "SASS", "Animation", "Accessibility"],
      color: "bg-yellow-500/10 text-yellow-500",
      avatar: "K"
    },
    {
      name: "Vishal Sagar Murthy",
      role: "Frontend Developer",
      icon: Server,
      description: "Creating engaging user experiences through innovative frontend solutions and interactive web components.",
      skills: ["Vue.js", "HTML5", "SASS", "Animation", "Accessibility"],
      color: "bg-green-200/10 text-green-500",
      avatar: "V"
    }
  ];

  return (
    <div className="min-h-screen">
      <Particles />
      
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Team
            </span>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <Badge className="px-4 py-2 text-lg bg-primary/10 text-primary border-primary/20">
            👥 Meet the Team
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Developers Behind CodeLab
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A passionate team of developers, engineers, and designers working together to 
            revolutionize coding education and assessment through innovative technology.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {developers.map((dev, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full ${dev.color} flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform`}>
                        {dev.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 p-2 rounded-full ${dev.color} group-hover:scale-110 transition-transform`}>
                        <dev.icon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <CardTitle className="text-xl">{dev.name}</CardTitle>
                      <Badge className={dev.color}>
                        {dev.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {dev.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-3">Core Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {dev.skills.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex} 
                            variant="secondary" 
                            className="text-xs bg-muted/50 hover:bg-muted transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(getDeveloperGithub(dev.name), '_blank')}
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(getDeveloperLinkedIn(dev.name), '_blank')}
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card">
            <CardContent className="py-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                  Team Statistics
                </h2>
                <p className="text-muted-foreground">
                  Our collective expertise and achievements
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">6</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-sm text-muted-foreground">Technologies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5</div>
                  <div className="text-sm text-muted-foreground">Specializations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Dedication</div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/about')} 
                  className="neon-button"
                >
                  Learn More About CodeLab
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Developers;
