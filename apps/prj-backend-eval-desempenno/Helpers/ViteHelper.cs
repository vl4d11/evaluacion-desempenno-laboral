using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace prj_backend_eval_desempenno.Helpers;

public static class ViteHelper
{
    private static readonly MemoryCache _cache = new(new MemoryCacheOptions());
    private const string BasePath = "/evaluacion";

    public static string GetViteAsset(string entry, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            return $"http://localhost:5120/{entry}";
        }

        var manifest = GetManifest(env);
        if (manifest.ValueKind == JsonValueKind.Undefined)
            return $"{BasePath}/js/home/{entry}";

        if (manifest.TryGetProperty(entry, out var info))
        {
            var file = info.GetProperty("file").GetString() ?? entry;
            return $"{BasePath}/js/home/{file}";
        }

        return $"{BasePath}/js/home/{entry}";
    }

    public static IEnumerable<string> GetViteCssAssets(string entry, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            yield break;
        }

        var manifest = GetManifest(env);
        if (manifest.ValueKind == JsonValueKind.Undefined)
            yield break;

        if (manifest.TryGetProperty(entry, out var info) && info.TryGetProperty("css", out var cssList))
        {
            foreach (var css in cssList.EnumerateArray())
            {
                yield return $"{BasePath}/js/home/{css.GetString()}";
            }
        }
    }

    private static JsonElement GetManifest(IWebHostEnvironment env)
    {
        if (_cache.TryGetValue("vite_manifest", out JsonElement manifest))
        {
            return manifest;
        }

        var manifestPath = Path.Combine(env.WebRootPath, "js", "home", "manifest.json");
        if (!File.Exists(manifestPath))
            return default;

        var json = File.ReadAllText(manifestPath);
        manifest = JsonSerializer.Deserialize<JsonElement>(json);
        _cache.Set("vite_manifest", manifest);
        return manifest;
    }
}
