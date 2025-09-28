"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";

import {
  Copy,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import MyTable from "../my-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CustomCheckbox from "../ui/checkbox";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const supportedLanguages = ["uzb", "rus", "eng"];

const languageNames = {
  uzb: "Uzbek",
  rus: "Russian",
  eng: "English",
};

interface TranslationData {
  [key: string]: { [translationKey: string]: string };
}

interface HistoryState {
  values: TranslationData;
  timestamp: number;
}

const TranslationEditor = ({
  initialTranslations,
}: {
  initialTranslations: TranslationData;
}) => {
  const [values, setValues] = useState<TranslationData>(initialTranslations);
  const [newKey, setNewKey] = useState("");
  const [newValues, setNewValues] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([
    { values: initialTranslations, timestamp: Date.now() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [compactView, setCompactView] = useState(true);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && unsavedChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [values, autoSave, unsavedChanges]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(values) !== JSON.stringify(initialTranslations);
    setUnsavedChanges(hasChanges);
  }, [values, initialTranslations]);

  // Add to history when values change
  const addToHistory = (newValues: TranslationData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ values: newValues, timestamp: Date.now() });
    setHistory(newHistory.slice(-50)); // Keep last 50 states
    setHistoryIndex(newHistory.length - 1);
  };

  // AI Translation function
  const translateWithAI = async (
    key: string,
    sourceText?: string,
    targetLanguage?: string
  ) => {
    try {
      setIsTranslating(true);
      setTranslatingKey(key);

      // If translating a specific language
      if (sourceText && targetLanguage) {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: sourceText,
            targetLanguage:
              languageNames[targetLanguage as keyof typeof languageNames],
            translationKey: key,
          }),
        });

        if (!response.ok) {
          throw new Error("Translation failed");
        }

        const data = await response.json();

        const updatedValues = {
          ...values,
          [targetLanguage]: {
            ...values[targetLanguage],
            [key]: data.translation,
          },
        };

        addToHistory(updatedValues);
        setValues(updatedValues);
        toast.success(
          `Translation generated for ${targetLanguage.toUpperCase()}`
        );
        return;
      }

      // If translating all languages from key
      const response = await fetch("/api/translate-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          translationKey: key,
          languages: supportedLanguages.map(
            (lng) => languageNames[lng as keyof typeof languageNames]
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();

      const updatedValues = { ...values };
      supportedLanguages.forEach((lng, index) => {
        if (data.translations[index]) {
          updatedValues[lng] = {
            ...updatedValues[lng],
            [key]: data.translations[index],
          };
        }
      });

      addToHistory(updatedValues);
      setValues(updatedValues);
      toast.success("AI translations generated for all languages!");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Failed to generate translations");
    } finally {
      setIsTranslating(false);
      setTranslatingKey(null);
    }
  };

  // Generate translations for new key
  const handleAddWithAI = async () => {
    if (!newKey.trim()) {
      toast.error("Please enter a translation key");
      return;
    }

    if (values.uzb?.[newKey]) {
      toast.error("Translation key already exists");
      return;
    }

    // First add the key with empty values
    const updatedValues = { ...values };
    supportedLanguages.forEach((lng) => {
      updatedValues[lng] = {
        ...updatedValues[lng],
        [newKey]: newValues[lng] || "",
      };
    });

    addToHistory(updatedValues);
    setValues(updatedValues);

    // Then generate AI translations
    await translateWithAI(newKey);

    setNewKey("");
    setNewValues({});
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setValues(history[historyIndex - 1].values);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setValues(history[historyIndex + 1].values);
    }
  };

  // Calculate translation progress
  const translationProgress = useMemo(() => {
    const allKeys = Object.keys(values?.uzb || {});
    if (allKeys.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    allKeys.forEach((key) => {
      const hasAllTranslations = supportedLanguages.every(
        (lng) => values[lng]?.[key] && values[lng][key].trim() !== ""
      );
      if (hasAllTranslations) completed++;
    });

    return {
      completed,
      total: allKeys.length,
      percentage: Math.round((completed / allKeys.length) * 100),
    };
  }, [values]);

  // Filter and search data
  const filteredData = useMemo(() => {
    const allKeys = Object.keys(values?.uzb || {});
    return allKeys
      .filter((key) => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const keyMatches = key.toLowerCase().includes(searchLower);
          const valueMatches = supportedLanguages.some((lng) =>
            values[lng]?.[key]?.toLowerCase().includes(searchLower)
          );
          if (!keyMatches && !valueMatches) return false;
        }

        // Language filter
        if (filterLanguage !== "all") {
          const hasValue =
            values[filterLanguage]?.[key] &&
            values[filterLanguage][key].trim() !== "";
          if (!hasValue) return false;
        }

        // Empty values filter
        if (showEmptyOnly) {
          const hasEmptyValue = supportedLanguages.some(
            (lng) => !values[lng]?.[key] || values[lng][key].trim() === ""
          );
          if (!hasEmptyValue) return false;
        }

        return true;
      })
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({
        key,
        ...supportedLanguages.reduce(
          (acc, lng) => {
            acc[lng] = values[lng]?.[key] || "";
            return acc;
          },
          {} as { [key: string]: string }
        ),
      }));
  }, [values, searchTerm, filterLanguage, showEmptyOnly]);

  const handleAdd = () => {
    if (!newKey.trim()) {
      toast.error("Please enter a translation key");
      return;
    }

    if (values.uzb?.[newKey]) {
      toast.error("Translation key already exists");
      return;
    }

    const updatedValues = { ...values };
    supportedLanguages.forEach((lng) => {
      updatedValues[lng] = {
        ...updatedValues[lng],
        [newKey]: newValues[lng] || "",
      };
    });

    addToHistory(updatedValues);
    setValues(updatedValues);
    setNewKey("");
    setNewValues({});
    toast.success("Translation key added successfully");
  };

  const handleDelete = (keyToDelete: string) => {
    const updatedValues = { ...values };
    supportedLanguages.forEach((lng) => {
      if (updatedValues[lng]) {
        delete updatedValues[lng][keyToDelete];
      }
    });

    addToHistory(updatedValues);
    setValues(updatedValues);
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(keyToDelete);
      return newSet;
    });
    handleSave();
    toast.success("Translation deleted successfully");
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;

    const updatedValues = { ...values };
    selectedRows.forEach((key) => {
      supportedLanguages.forEach((lng) => {
        if (updatedValues[lng]) {
          delete updatedValues[lng][key];
        }
      });
    });

    addToHistory(updatedValues);
    setValues(updatedValues);
    setSelectedRows(new Set());
    handleSave();
    toast.success(`${selectedRows.size} translations deleted successfully`);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await Promise.all(
        supportedLanguages.map(async (lng) => {
          const res = await fetch(`/api/save-translation?locale=${lng}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values[lng]),
          });
          if (!res.ok) throw new Error(`Error saving ${lng} translations`);
        })
      );
      setUnsavedChanges(false);
      toast.success("Translations saved successfully");
    } catch (error) {
      console.error("Error saving translations:", error);
      toast.error("Error saving translations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(values, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `translations-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Translations exported successfully");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        addToHistory(importedData);
        setValues(importedData);
        toast.success("Translations imported successfully");
      } catch (error) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard");
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((item) => item.key)));
    }
  };

  const columns = [
    {
      title: (
        <div className="flex gap-2 items-center">
          <CustomCheckbox
            checked={
              selectedRows.size === filteredData.length &&
              filteredData.length > 0
            }
            onCheckedChange={handleSelectAll}
          />
          <span>Key</span>
        </div>
      ),
      dataIndex: "key",
      key: "key",
      render: (text: string) => (
        <div className="flex gap-2 items-center">
          <CustomCheckbox
            checked={selectedRows.has(text)}
            onCheckedChange={(checked: boolean) => {
              const newSet = new Set(selectedRows);
              if (checked) {
                newSet.add(text);
              } else {
                newSet.delete(text);
              }
              setSelectedRows(newSet);
            }}
          />
          <div className="flex gap-1 items-center">
            <code className="px-1 text-sm rounded bg-muted">{text}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyKey(text)}
              className="p-0 w-6 h-6"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => translateWithAI(text)}
              disabled={isTranslating}
              className="p-0 w-6 h-6"
              title="Generate AI translations"
            >
              {isTranslating && translatingKey === text ? (
                <RotateCcw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      ),
    },
    ...supportedLanguages.map((lng) => ({
      title: (
        <div className="flex gap-2 items-center">
          <span className="font-semibold uppercase">{lng}</span>
          <Badge variant="outline" className="text-xs">
            {
              Object.keys(values[lng] || {}).filter((key) =>
                values[lng][key]?.trim()
              ).length
            }
          </Badge>
        </div>
      ),
      dataIndex: lng,
      key: lng,
      render: (text: string, record: { key: string }) => (
        <div className="space-y-1">
          <div className="flex gap-1 items-center">
            {compactView ? (
              <Input
                value={text}
                onChange={(e) => {
                  const newValues = {
                    ...values,
                    [lng]: { ...values[lng], [record.key]: e.target.value },
                  };
                  setValues(newValues);
                }}
                className={`min-w-[200px] ${
                  !text?.trim() ? "border-red-500 border" : ""
                }`}
                placeholder={`Enter ${lng.toUpperCase()} translation`}
              />
            ) : (
              <Textarea
                value={text}
                onChange={(e) => {
                  const newValues = {
                    ...values,
                    [lng]: { ...values[lng], [record.key]: e.target.value },
                  };
                  setValues(newValues);
                }}
                className="min-w-[200px] min-h-[60px]"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Find a source text from other languages
                const sourceText = supportedLanguages
                  .filter((l) => l !== lng)
                  .map((l) => values[l]?.[record.key])
                  .find((t) => t && t.trim());

                if (sourceText) {
                  translateWithAI(record.key, sourceText, lng);
                } else {
                  toast.error("No source text found for translation");
                }
              }}
              disabled={isTranslating}
              className="p-0 w-8 h-8"
              title={`Generate AI translation for ${lng.toUpperCase()}`}
            >
              {isTranslating && translatingKey === record.key ? (
                <RotateCcw className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      ),
    })),
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: { key: string }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(record.key)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container py-20 mx-auto space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>AI-Powered Translation Editor</span>
            <div className="flex gap-2 items-center">
              {unsavedChanges && (
                <Badge variant="destructive" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              <Badge variant="outline">
                {filteredData.length} / {Object.keys(values?.uzb || {}).length}{" "}
                keys
              </Badge>
              <Badge variant="secondary" className="flex gap-1 items-center">
                <Sparkles className="w-3 h-3" />
                AI Enabled
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Translation Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {translationProgress.completed}/{translationProgress.total}
                </span>
              </div>
              <Progress
                value={translationProgress.percentage}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Languages</span>
              <div className="flex gap-1">
                {supportedLanguages.map((lng) => (
                  <Badge key={lng} variant="secondary" className="text-xs">
                    {lng.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Auto-save</span>
              <div className="flex gap-2 items-center">
                <CustomCheckbox
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
                <span className="text-sm">Enable auto-save</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {supportedLanguages.map((lng) => (
                    <SelectItem key={lng} value={lng}>
                      {lng.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 items-center">
                <CustomCheckbox
                  checked={showEmptyOnly}
                  onCheckedChange={setShowEmptyOnly}
                />
                <span className="text-sm">Show incomplete only</span>
              </div>
              <div className="flex gap-2 items-center">
                <CustomCheckbox
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
                <span className="text-sm">Compact view</span>
              </div>
            </div>
          </div>

          {selectedRows.size > 0 && (
            <div className="p-3 mt-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {selectedRows.size} item(s) selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add New Translation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Plus className="w-5 h-5" />
            Add New Translation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <Input
                placeholder="Translation key (e.g., 'common.save')"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            {supportedLanguages.map((lng) => (
              <div key={lng}>
                <Input
                  placeholder={`${lng.toUpperCase()} translation`}
                  value={newValues[lng] || ""}
                  onChange={(e) =>
                    setNewValues((prev) => ({ ...prev, [lng]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd} disabled={!newKey.trim()}>
              <Plus className="w-4 h-4" />
              Add Translation
            </Button>
            <Button
              onClick={handleAddWithAI}
              disabled={!newKey.trim() || isTranslating}
              variant="secondary"
              className="flex gap-2 items-center"
            >
              {isTranslating ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Add with AI Translations
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !unsavedChanges}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? "Saving..." : "Save All"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Translation Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-h-[60vh] overflow-auto">
            <MyTable
              dataSource={filteredData}
              columns={columns as any}
              rowKey="key"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {unsavedChanges ? "You have unsaved changes" : "All changes saved"}
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading || !unsavedChanges}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isLoading ? "Saving..." : "Save All"}
        </Button>
      </div>
    </div>
  );
};

export default TranslationEditor;
