import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  FileText, 
  Settings, 
  User, 
  CheckCircle,
  XCircle,
  Play,
  Pause,
  LogOut,
  Upload,
  Timer,
  BookOpen,
  Monitor
} from 'lucide-react';
import Particles from '@/components/Particles';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [examTime, setExamTime] = useState('120');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [syllabusContent, setSyllabusContent] = useState('');

  // Mock data for student status
  const students = [
    { 
      id: 1, 
      name: "John Doe", 
      rollNumber: "CS001", 
      status: "active", 
      currentQuestion: 3, 
      timeRemaining: "45:30",
      responses: 2 
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      rollNumber: "CS002", 
      status: "completed", 
      currentQuestion: 5, 
      timeRemaining: "00:00",
      responses: 5 
    },
    { 
      id: 3, 
      name: "Bob Johnson", 
      rollNumber: "CS003", 
      status: "disconnected", 
      currentQuestion: 1, 
      timeRemaining: "58:20",
      responses: 1 
    },
    { 
      id: 4, 
      name: "Alice Brown", 
      rollNumber: "CS004", 
      status: "active", 
      currentQuestion: 4, 
      timeRemaining: "52:15",
      responses: 3 
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-500/10 text-green-500",
      completed: "bg-blue-500/10 text-blue-500",
      disconnected: "bg-red-500/10 text-red-500"
    };
    return variants[status as keyof typeof variants] || "bg-yellow-500/10 text-yellow-500";
  };

  return (
    <div className="min-h-screen">
      <Particles />
      
      {/* Header */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Settings className="h-8 w-8 text-primary animate-spin-slow" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">CodeLab Examination System</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="exam-settings">Exam Settings</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus Management</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Students</p>
                        <p className="text-3xl font-bold text-primary">
                          {students.filter(s => s.status === 'active').length}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-3xl font-bold text-blue-500">
                          {students.filter(s => s.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Disconnected</p>
                        <p className="text-3xl font-bold text-red-500">
                          {students.filter(s => s.status === 'disconnected').length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Students</p>
                        <p className="text-3xl font-bold text-primary">{students.length}</p>
                      </div>
                      <Monitor className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Exam Settings Tab */}
            <TabsContent value="exam-settings" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Exam Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure exam duration and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="exam-time">Exam Duration (minutes)</Label>
                      <Input
                        id="exam-time"
                        type="number"
                        value={examTime}
                        onChange={(e) => setExamTime(e.target.value)}
                        placeholder="120"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="exam-subject">Subject</Label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming Fundamentals</SelectItem>
                          <SelectItem value="data-structures">Data Structures</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="web-dev">Web Development</SelectItem>
                          <SelectItem value="database">Database Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="neon-button">
                      <Play className="h-4 w-4 mr-2" />
                      Start Exam
                    </Button>
                    <Button variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Exam
                    </Button>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      End Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Syllabus Management Tab */}
            <TabsContent value="syllabus" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Syllabus Management
                  </CardTitle>
                  <CardDescription>
                    Upload and manage syllabus for different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="syllabus-subject">Subject</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming Fundamentals</SelectItem>
                          <SelectItem value="data-structures">Data Structures</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="web-dev">Web Development</SelectItem>
                          <SelectItem value="database">Database Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Upload Syllabus File</Label>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="syllabus-content">Syllabus Content</Label>
                    <Textarea
                      id="syllabus-content"
                      value={syllabusContent}
                      onChange={(e) => setSyllabusContent(e.target.value)}
                      placeholder="Enter syllabus content here..."
                      rows={10}
                    />
                  </div>
                  
                  <Button className="neon-button">
                    <FileText className="h-4 w-4 mr-2" />
                    Save Syllabus
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Live Student Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time monitoring of student exam progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="glass-card p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(student.status)}
                              <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Roll: {student.rollNumber}
                                </p>
                              </div>
                            </div>
                            
                            <Badge className={getStatusBadge(student.status)}>
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Question</p>
                              <p className="font-bold text-primary">{student.currentQuestion}/5</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Time Left</p>
                              <p className="font-bold text-primary">{student.timeRemaining}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Responses</p>
                              <p className="font-bold text-primary">{student.responses}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;