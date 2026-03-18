


import React from 'react'

import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card"
import {
  FileText,
  IndianRupee,
  ShoppingCart,
  Clock, Search, Plus, MoreHorizontal,
  
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


const dashboardCards = [
  {
    title: "Open Requests",
    value: "24",
    subtitle: "+3 from yesterday",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    subtitleColor: "text-muted-foreground",
  },
  {
    title: "Pending Approvals",
    value: "8",
    subtitle: "-2 from yesterday",
    icon: IndianRupee,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    subtitleColor: "text-muted-foreground",
  },
  {
    title: "Active POs",
    value: "12",
    subtitle: "+5 this week",
    icon: ShoppingCart,
    iconBg: "bg-purple-100",
    iconColor: "text-green-500 text-2xl",
  },
  {
    title: "Low Stock Items",
    value: "5",
    subtitle: "Requires attention",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueSize: "text-5xl",
  },
];

const Masters = () => {
  return (
    <div>
       <div  className="p-4 space-y-4 bg-blue-50 min-h-screen">
      
      {/* Header */}
      <div>
       
      </div>

      {/* Cards */}
      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card key={index} className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>

              <CardContent>
                <div className={`font-bold ${card.valueSize ?? "text-3xl"}`}>
                  {card.value}
                </div>

                <p
                  className={`mt-1 text-sm ${
                    card.subtitleColor ?? "text-muted-foreground"
                  }`}
                >
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
     </div>
    <div>

       <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList >
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              View your key metrics and recent project activity. Track progress
              across all your active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 12 active projects and 3 pending tasks.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports. Export data in
              multiple formats for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options. Customize your
              experience to fit your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configure notifications, security, and themes.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
</div>
<div>


  <p>bhavav</p>
</div>
    </div>
  )
}

export default Masters

