
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LogoUpload = () => {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simular upload
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        setLogoUrl(url);
        setIsUploading(false);
      }, 1500);
    }
  };

  const removeLogo = () => {
    setLogoUrl("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo do Delivery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="logo">Upload da logo do seu delivery</Label>
          <div className="mt-2">
            {logoUrl ? (
              <div className="space-y-4">
                <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white p-2">
                  <img
                    src={logoUrl}
                    alt="Logo do restaurante"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-input')?.click()}
                  >
                    Alterar Logo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={removeLogo}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-2">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">
                    Clique para fazer upload da logo ou arraste o arquivo aqui
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG até 2MB
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById('logo-input')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Fazendo upload..." : "Selecionar Arquivo"}
                  </Button>
                </div>
              </div>
            )}
            <Input
              id="logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
        
        {logoUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Logo carregada com sucesso! Ela aparecerá no topo do seu painel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
