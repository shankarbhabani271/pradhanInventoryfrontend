
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
const stats = [
  { title: "Total Inspections", value: "124" },
  { title: "Completed", value: "86" },
  { title: "Pending", value: "28" },
  { title: "Failed", value: "10" },
];

const QcManagement = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">QC Inspections</h1>
          <p className="text-muted-foreground">
            Manage and track all quality inspections
          </p>
        </div>
        <Button 
        onClick={()=>navigate("/studentpage")}
        className="gap-2 bg-[#0284C5]">
          <Plus className="w-4 h-4" />
          New Inspection
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search QC ID, GRN, Item..."
          className="max-w-sm"
        />
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inspections" className="w-full text-black">
        <TabsList className="bg-[#94A3B8]">
          <TabsTrigger value="inspections" className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all">Inspections</TabsTrigger>
          <TabsTrigger value="checklists"
          className="flex-1 flex items-center justify-center
             h-full text-black rounded-sm
              hover:bg-white data-[state=active]:bg-white
               data-[state=active]:text-black data-[state=active]:shadow-md 
               transition-all"
          >Checklists</TabsTrigger>
        </TabsList>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">QC ID</th>
                    <th className="p-3">GRN No</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Inspector</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">QC-2024-001</td>
                    <td className="p-3">GRN-0156</td>
                    <td className="p-3">Steel Pipes 2 inch</td>
                    <td className="p-3">Steel Corp Ltd</td>
                    <td className="p-3">500</td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-700">
                        Pass
                      </Badge>
                    </td>
                    <td className="p-3">Mike Chen</td>
                    <td className="p-3">...</td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">QC-2024-002</td>
                    <td className="p-3">GRN-0157</td>
                    <td className="p-3">Electrical Cable 4mm</td>
                    <td className="p-3">ElectroPower Inc</td>
                    <td className="p-3">1000</td>
                    <td className="p-3">
                      <Badge variant="secondary">Pending</Badge>
                    </td>
                    <td className="p-3">-</td>
                    <td className="p-3">Unassigned</td>
                    <td className="p-3">...</td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">QC-2024-003</td>
                    <td className="p-3">GRN-0155</td>
                    <td className="p-3">Cement Bags 50kg</td>
                    <td className="p-3">BuildMart Supplies</td>
                    <td className="p-3">200</td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-red-100 text-red-600">
                        Fail
                      </Badge>
                    </td>
                    <td className="p-3">Sarah Wilson</td>
                    <td className="p-3">...</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Checklist List */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>QC Checklists</CardTitle>
                <Button size="sm" className="bg-[#0284C5]">New Checklist</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border bg-muted/40">
                  <p className="font-medium">Steel Materials Inspection</p>
                  <p className="text-sm text-muted-foreground">
                    Raw Materials • 12 items
                  </p>
                </div>

                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Electrical Components Check</p>
                  <p className="text-sm text-muted-foreground">
                    Electrical • 8 items
                  </p>
                </div>

                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Safety Equipment Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Safety • 15 items
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Inspection Checklist Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Visual inspection for defects",
                  "Dimension verification",
                  "Weight measurement",
                  "Material composition test",
                  "Surface finish check",
                  "Packaging condition",
                  "Documentation verification",
                  "Batch/Serial number verification",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="checkbox" className="accent-blue-600" />
                    {item}
                  </label>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-[#0284C5]">Mark as Pass</Button>
                  <Button variant="destructive" className="flex-1 bg-fuchsia-500">
                    Mark as Fail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default QcManagement;
