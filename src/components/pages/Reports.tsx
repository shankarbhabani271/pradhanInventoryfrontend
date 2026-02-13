
import { Button } from "@/components/ui/button"
import { Dot, TrendingUp,  } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

/* ===================== Stock Movement ===================== */

const stockChartData = [
  { month: "Jul", inward: 4000, outward: 2500 },
  { month: "Aug", inward: 3000, outward: 1500 },
  { month: "Sep", inward: 2000, outward: 3800 },
  { month: "Oct", inward: 2800, outward: 4000 },
  { month: "Nov", inward: 1800, outward: 4800 },
  { month: "Dec", inward: 2400, outward: 3800 },
  { month: "Jan", inward: 3500, outward: 4300 },
]

const stockChartConfig = {
  inward: { label: "Inward", color: "#0284c7" },
  outward: { label: "Outward", color: "#94a3b8" },
} satisfies ChartConfig

const StockMovementChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl">Stock Movement</CardTitle>
      <CardDescription>Monthly inward vs outward</CardDescription>
    </CardHeader>

    <CardContent>
      <ChartContainer config={stockChartConfig} className="h-[220px]">
        <BarChart data={stockChartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="inward" fill="#0284c7" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outward" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </CardContent>

    <CardFooter className="flex gap-2 text-sm">
      <TrendingUp className="h-4 w-4" />
      Stock trend stable
    </CardFooter>
  </Card>
)

/* ===================== Donut Chart ===================== */

const donutData = [
  { name: "Electronics", value: 35, color: "#0284c7" },
  { name: "Clothing", value: 25, color: "#334155" },
  { name: "Furniture", value: 15, color: "#cbd5e1" },
  { name: "Grocery", value: 10, color: "#94a3b8" },
  { name: "Others", value: 15, color: "#64748b" },
]

const DonutChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl">Inventory by Category</CardTitle>
      <CardDescription>Product-wise share</CardDescription>
    </CardHeader>

    <CardContent className="h-[260px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={donutData}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
          >
            {donutData.map((item, i) => (
              <Cell key={i} fill={item.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>

    <CardFooter className="flex flex-col gap-2 text-sm">
      {donutData.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Dot className="w-5 h-5" style={{ color: item.color, fill: item.color }} />
          <span>{item.name} ({item.value}%)</span>
        </div>
      ))}
    </CardFooter>
  </Card>
)

/* ===================== Procurement Trend ===================== */

const procurementData = [
  { month: "Jul", value: 45000 },
  { month: "Aug", value: 52000 },
  { month: "Sep", value: 48000 },
  { month: "Oct", value: 61000 },
  { month: "Nov", value: 55000 },
  { month: "Dec", value: 67000 },
  { month: "Jan", value: 73000 },
]

const ProcurementTrendChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl">Procurement Trend</CardTitle>
      <CardDescription></CardDescription>
    </CardHeader>

    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart className="text-black" data={procurementData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0284c7"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

/* ===================== MAIN ===================== */

const Reports = () => {
  return (
    <div className="p-4 space-y-6 bg-blue-50 min-h-screen">
      <Tabs defaultValue="procurement">
        <div className="flex justify-between mb-4">
          <TabsList className="bg-[#94A3B8]">
            <TabsTrigger value="procurement " className="text-black">Procurement</TabsTrigger>
          </TabsList>
          <Button className="bg-blue-700 text-white">Export Reports</Button>
        </div>

        <TabsContent value="procurement">
          <div className="grid gap-4 lg:grid-cols-2">
            <StockMovementChart />
            <DonutChart />
          </div>

          <div className="mt-4">
            <ProcurementTrendChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reports
