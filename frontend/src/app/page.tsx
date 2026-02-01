import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Briefcase,
  Shield,
  MessageSquare,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            NDIS Support Marketplace
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Disable Help Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting support workers with clients in need. A modern, professional platform for NDIS support services.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>For Support Workers</CardTitle>
              <CardDescription>
                Find meaningful work, manage your profile, and connect with clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Profile builder with credentials</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Browse and apply for jobs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Invoice submission system</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Client messaging</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>For Clients</CardTitle>
              <CardDescription>
                Post jobs, find qualified workers, and manage your support services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Create job postings</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Review worker applications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Session scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Worker management</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Platform Admin</CardTitle>
              <CardDescription>
                Comprehensive oversight and management tools for administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Invoice approval system</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Credential compliance</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Message oversight</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Platform analytics</span>
              </div>
            </CardContent>
          </Card>
        </div>

       

        {/* CTA Section */}
        <Card className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">Ready to Get Started?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Join our platform today and experience seamless NDIS support services
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              Contact Us
            </Button>
          </CardContent>
        </Card>

     
      </div>
    </div>
  );
}
