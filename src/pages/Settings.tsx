import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <AppLayout>
      <PageHeader title="설정" description="앱 환경설정을 관리합니다" />

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">프로필</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="이름을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="이메일을 입력하세요" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">알림</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">마감일 알림</p>
                  <p className="text-xs text-muted-foreground">마감 2일 전 알림을 받습니다</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">새 의뢰 알림</p>
                  <p className="text-xs text-muted-foreground">새 의뢰가 등록되면 알림을 받습니다</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>저장</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
