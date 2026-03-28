using Microsoft.AspNetCore.Diagnostics;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load(
    Path.Combine(builder.Environment.ContentRootPath, ".env")
);

var archivoLog = Path.Combine(
    builder.Environment.ContentRootPath,
    builder.Configuration["AppSettings:ArchivoLog"] ?? "logs/log.txt"
);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
    )
    .WriteTo.File(
        path: archivoLog,
        restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Error,
        rollingInterval: RollingInterval.Day,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}",
        retainedFileCountLimit: 7
    )
    .CreateLogger();

builder.Host.UseSerilog();
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("frontend", policy =>
        {
            policy.WithOrigins("http://localhost:5120")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });
}

builder.Configuration.AddEnvironmentVariables();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UsePathBase("/evaluacion");

    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "text/html";
            var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
            if (exceptionHandlerPathFeature?.Error != null)
            {
                Log.Error(exceptionHandlerPathFeature.Error, "Unhandled exception occurred at {Path}", exceptionHandlerPathFeature.Path);
            }
            await context.Response.WriteAsync("<h1>Ocurrió un error en el servidor.</h1>");
        });
    });
    app.UseHsts();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

if (app.Environment.IsDevelopment())
{
    app.UseCors("frontend");
}

app.UseAuthorization();

app.MapControllerRoute(
    name: "evaluacion",
    pattern: "{controller=Evaluacion}/{action=Desempenno}"
);

app.MapFallbackToController(
    action: "Desempenno",
    controller: "Evaluacion"
);

app.Run();
