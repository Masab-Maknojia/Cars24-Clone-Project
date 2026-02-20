# 1. Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# 2. Copy the project file and install dependencies
COPY *.csproj ./
RUN dotnet restore

# 3. Copy the rest of your code and build the release
COPY . ./
RUN dotnet publish -c Release -o out

# 4. Use the lighter runtime image for the final deployment
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# 5. Tell Render which port to use
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# 6. Start the API
ENTRYPOINT ["dotnet", "Cars24API.dll"]