import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar, ExternalLink, Github, Youtube, Store, Shield, Linkedin, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

export function HomeContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Hey, David! 👋
      </h1>

      {/* Activation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You've completed 1/5 activation requirements. Once you hit all 5, you will get a gift card to claim your FREE merch! 👀
          </p>
          <Button variant="secondary">See Progress</Button>
        </CardContent>
      </Card>

      {/* Onboarding Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attend an Onboarding Session 📅
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Attend an onboarding session to learn more about ColorStack and meet other members!
          </p>
          <Button className="bg-teal-600 hover:bg-teal-700">
            Book Onboarding Session
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Activity Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            You are considered active in a week if you have either sent a Slack message or reacted to a Slack message, in that week.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">This Week (12/29 - 1/4)</h3>
              <Badge variant="success">Active</Badge>
            </div>
            <div>
              <h3 className="font-medium mb-2">Last 16 Weeks</h3>
              <div className="grid grid-cols-8 gap-1">
                {Array(16).fill(null).map((_, i) => (
                  <div 
                    key={i}
                    className={`h-4 w-full rounded ${i % 3 === 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Member #</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">14567</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">13,547</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Events Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">9</p>
          </CardContent>
        </Card>
      </div>

      {/* Important Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Important Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="#" className="flex items-center gap-2 text-teal-600 hover:underline">
            <img src="/slack-logo.svg" alt="Slack" className="h-5 w-5" />
            Slack
            <span className="text-gray-600 font-normal">- The heartbeat of our community.</span>
          </Link>
          
          <Link href="#" className="flex items-center gap-2 text-teal-600 hover:underline">
            <Github className="h-5 w-5" />
            GitHub
            <span className="text-gray-600 font-normal">- The codebase where our software, called Oyster, lives. Go read + contribute to the codebase!</span>
          </Link>
          
          <Link href="#" className="flex items-center gap-2 text-teal-600 hover:underline">
            <Youtube className="h-5 w-5" />
            YouTube Channel
            <span className="text-gray-600 font-normal">- A collection of our past event recordings. Don't miss a beat!</span>
          </Link>
          
          <Link href="#" className="flex items-center gap-2 text-teal-600 hover:underline">
            <Store className="h-5 w-5" />
            Merch Store
            <span className="text-gray-600 font-normal">- Show off your ColorStack pride with our new merch collection!</span>
          </Link>
          
          <Link href="#" className="flex items-center gap-2 text-teal-600 hover:underline">
            <Shield className="h-5 w-5" />
            Code of Conduct
            <span className="text-gray-600 font-normal">- Don't act a fool. Abide by our Code of Conduct!</span>
          </Link>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ColorStack Socials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Be sure to follow us on all our socials to stay up to date with what's happening in ColorStack.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-teal-600 hover:text-teal-700">
              <Linkedin className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-teal-600 hover:text-teal-700">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-teal-600 hover:text-teal-700">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-teal-600 hover:text-teal-700">
              <Github className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-teal-600 hover:text-teal-700">
              <Youtube className="h-6 w-6" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 