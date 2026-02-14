import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useSubjects } from "../hooks/useSubjects";
import { useDocuments } from "../hooks/useDocuments";
import UploadDocument from "../components/documents/UploadDocument";
import SubjectSelector from "../components/common/SubjectSelector";
import { 
  FileText, 
  Brain, 
  Upload, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star,
  Plus,
  BarChart3,
  Target,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: documents = [], isLoading: documentsLoading } = useDocuments();

  // Calculate dashboard statistics
  const totalDocuments = documents.length;
  const totalSubjects = subjects.length;
  const recentDocuments = documents.slice(0, 5);
  const documentTypesCount = documents.reduce((acc:any, doc:any) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "Upload Document",
      description: "Add new study materials",
      icon: Upload,
      color: "bg-blue-500",
      action: () => setShowUpload(true)
    },
    {
      title: "Create Subject",
      description: "Organize your studies",
      icon: BookOpen,
      color: "bg-green-500",
      link: "/subjects"
    },
    {
      title: "Start Analysis",
      description: "AI-powered insights",
      icon: Brain,
      color: "bg-purple-500",
      link: "/analysis/subject"
    },
    {
      title: "Quick Predict",
      description: "Question predictions",
      icon: Zap,
      color: "bg-orange-500",
      link: "/predict/quick"
    }
  ];

  const recentActivity = [
    {
      type: "document",
      title: "Added new document",
      time: "2 hours ago",
      status: "success"
    },
    {
      type: "analysis", 
      title: "Completed analysis",
      time: "1 day ago",
      status: "success"
    },
    {
      type: "subject",
      title: "Created new subject",
      time: "2 days ago", 
      status: "success"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {getGreeting()}! 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome to your NoteSnap dashboard. Manage your studies and get AI-powered insights.
        </p>
      </div>

      {/* Quick Upload Section */}
      {showUpload ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <SubjectSelector
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
              />
            </div>

            <UploadDocument 
              subjectId={selectedSubjectId}
              onUploadComplete={() => {
                setShowUpload(false);
                setSelectedSubjectId("");
              }}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUpload(false);
                  setSelectedSubjectId("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <div className="mt-3">
                  {action.action ? (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={action.action}
                    >
                      {action.title}
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full" asChild>
                      <Link to={action.link!}>
                        {action.title}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{totalSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Analysis Ready</p>
                <p className="text-2xl font-bold">
                  {subjects.filter(s => 
                    documents.some(d => d.subjectId === s.id)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Types</p>
                <p className="text-2xl font-bold">{Object.keys(documentTypesCount).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/documents">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (

              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{doc.documentType}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-muted-foreground">No documents yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowUpload(true)}
                >
                  Upload your first document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Types Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Document Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(documentTypesCount).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(documentTypesCount).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="capitalize font-medium">{type}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-muted-foreground">No document types yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {totalDocuments === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Getting Started with NoteSnap</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Upload your first document to unlock AI-powered analysis and question predictions.
                </p>
              </div>
              <Button 
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
