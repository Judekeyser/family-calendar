const templateRepository = new Map();
templateRepository.set("appointment_list", "JTNDZGwlM0UlMjAlN0IjJTIwYXBwb2ludG1lbnRzJTdEJTIwJTNDZHQlMjAlN0IjJTdEJTIwJTdCJTI1JTIwY2xpY2slN0QlMjAlN0IvJTdEJTIwJTNFJTIwJTdCPyUyMGlzRGF5T2ZmJTdEJTIwJiM5OTY5OyYjMTYwOyUyMCU3Qi8lN0RMZSUyMCUzQ2FwcC1sb25nLWZyZW5jaC1kYXRlJTIwJTdCIyU3RCUyMCU3QiUyMHN0ckRhdGUlMjAlN0MlMjBzdHJEYXRlJTIwJTdEJTIwJTdCLyU3RCUyMCUzRSUzQy9hcHAtbG9uZy1mcmVuY2gtZGF0ZSUzRSwlMjAlM0NhcHAtbG9uZy1mcmVuY2gtdGltZSUyMGNhc2U9JTIybG93ZXJjYXNlJTIyJTIwJTdCIyU3RCUyMCU3QiUyMHN0clRpbWUlMjAlN0MlMjBzdHJUaW1lJTIwJTdEJTIwJTdCLyU3RCUyMCUzRSUzQy9hcHAtbG9uZy1mcmVuY2gtdGltZSUyMCUzRSUzQ3NwYW4lMjAlN0IjJTdEJTIwJTdCOiUyMG1hcmtVbnJlYWQlMjAlN0QlMjAlN0IlMjAlMjJoaWRkZW4lMjAlN0MlMjBjbGFzcyUyMCU3RCUyMCU3Qi8lN0QlMjAlN0IvJTdEJTIwJTNFKiUzQy9zcGFuJTNFJTNDL2R0JTNFJTIwJTNDZGQlMjAlN0IjJTdEJTIwJTdCJCUyMHN0ckRlc2NyaXB0aW9uJTdEJTIwJTdCLyU3RCUyMCUzRSUzQy9kZCUzRSUyMCUzQ2RkJTIwJTdCIyU3RCUyMCU3QiQlMjBzdHJEZXRhaWxzJTdEJTIwJTdCLyU3RCUyMCUzRSUzQy9kZCUzRSUyMCU3Qi8lN0QlMjAlM0MvZGwlM0U=");
templateRepository.set("appointments-search_main", "JTNDbmF2JTNFJTIwJTNDbWVudSUzRSUyMCU3QiMlMjBtZW51JTdEJTIwJTdCIyUyMGJhY2slN0QlMjAlM0NsaSUzRSUzQ2ElMjAlN0IjJTdEJTIwJTdCJTI1JTIwY2xpY2slN0QlMjAlN0IvJTdEJTIwJTNFJiMxMjgxOTc7JTNDL2ElM0UlM0MvbGklM0UlMjAlN0IvJTdEJTIwJTdCLyU3RCUyMCUzQy9tZW51JTNFJTIwJTNDL25hdiUzRSUyMCUzQ2gxJTNFUmVjaGVyY2hlciUyMHVuJTIwcmVuZGV6LXZvdXMlM0MvaDElM0UlMjAlM0Nmb3JtJTIwY2xhc3M9JTIydGV4dC1jZW50ZXJlZCUyMiUyMCU3QiMlN0QlMjAlN0IlMjUlMjBzdWJtaXQlMjAlN0QlMjAlN0IvJTdEJTIwJTNFJTIwJTNDaW5wdXQlMjB0eXBlPSUyMnRleHQlMjIlMjBuYW1lPSUyMnNlYXJjaCUyMiUyMCU3QiMlN0QlMjAlN0IlMjBkZWZhdWx0U2VhcmNoUXVlcnklMjAlN0MlMjB2YWx1ZSUyMCU3RCUyMCU3Qi8lN0QlMjAlM0UlMjAlM0NidXR0b24lM0VSZWNoZXJjaGVyJTNDL2J1dHRvbiUzRSUyMCUzQy9mb3JtJTNFJTIwJTNDZGl2JTIwZGF0YS1pZD0lMjJhcHBvaW50bWVudHNfbGlzdCUyMiUzRSUzQy9kaXYlM0UlMjAlM0NociUzRSUyMCUzQ3AlMjBjbGFzcz0lMjJ0ZXh0LWNlbnRlcmVkJTIyJTNFJTNDc21hbGwlM0VQb3VyJTIwbGUlMjBtb21lbnQsJTIwbGElMjByZWNoZXJjaGUlMjBuZSUyMGNpYmxlJTIwcXVlJTIwbGVzJTIwJUMzJUE5diVDMyVBOW5lbWVudHMlMjBmdXR1cnMlM0NiciUzRWV0JTIwcHIlQzMlQTlzZW50ZSUyMGxlcyUyMGRpeCUyMG1laWxsZXVycyUyMHIlQzMlQTlzdWx0YXRzLiUzQ2JyJTNFQ2VzJTIwciVDMyVBOXN1bHRhdHMlMjBwb3VycmFpZW50JTIwbmUlMjBwYXMlMjB0b3VzJTIwJUMzJUFBdHJlJTIwcGVydGluZW50cy4lM0Mvc21hbGwlM0UlM0MvcCUzRQ==");
templateRepository.set("authentication-pane", "JTNDYXBwLWF1dGhlbnRpY2F0aW9uLWZvcm0lMjAlN0IjJTdEJTIwJTdCJTI1JTIwYXBwLWF1dGhlbnRpZnklN0QlMjAlN0IlMjB1c2VybmFtZSUyMCU3QyUyMHVzZXJuYW1lJTIwJTdEJTIwJTdCLyU3RCUyMCUzRSUyMCUzQ2Zvcm0lM0UlMjAlM0NpbnB1dCUyMHR5cGU9JTIydGV4dCUyMiUyMGNsYXNzPSUyMmhpZGRlbiUyMiUyMG5hbWU9JTIydXNlcm5hbWUlMjIlMjBhdXRvY29tcGxldGU9JTIydXNlcm5hbWUlMjIlMjB2YWx1ZT0lMjJhcHB2MSUyMiUyMHJlYWRvbmx5JTIwZGlzYWJsZWQlM0UlMjAlM0NmaWVsZHNldCUzRSUyMCUzQ3AlMjBjbGFzcz0lMjJ0ZXh0LWNlbnRlcmVkJTIyJTNFJTIwJTNDbGFiZWwlM0VNb3QlMjBkZSUyMHBhc3NlJTNDL2xhYmVsJTNFJiMxNjA7OiUyMCUzQ2JyJTNFJTIwJTNDaW5wdXQlMjB0eXBlPSUyMnBhc3N3b3JkJTIyJTIwbmFtZT0lMjJwYXNzd29yZCUyMiUyMGF1dG9jb21wbGV0ZT0lMjJuZXctcGFzc3dvcmQlMjIlMjByZXF1aXJlZCUzRSUyMCUzQy9wJTNFJTIwJTNDL3AlM0UlMjAlM0NmaWVsZHNldCUyMGNsYXNzPSUyMnRleHQtY2VudGVyZWQlMjIlM0UlMjAlM0NwJTIwY2xhc3M9JTIydGV4dC1jZW50ZXJlZCUyMiUzRSUyMCUzQ2xhYmVsJTNFSWRlbnRpdCVDMyVBOSUzQy9sYWJlbCUzRSYjMTYwOzolM0NiciUzRSUyMCUzQ3NlbGVjdCUyMG5hbWU9JTIyaWRlbnRpdHklMjIlMjByZXF1aXJlZCUzRSUyMCUzQ29wdGlvbiUyMHZhbHVlPSUyMiUyMiUyMGRpc2FibGVkJTNFSWRlbnRpdCVDMyVBOSUyMHV0aWxpc2F0ZXVyJTNDL29wdGlvbiUzRSUyMCUzQ29wdGlvbiUyMHZhbHVlPSUyMmNhcm9saW5lJTIyJTNFQ2Fyb2xpbmUlM0Mvb3B0aW9uJTNFJTIwJTNDb3B0aW9uJTIwdmFsdWU9JTIyanVzdGluJTIyJTNFSnVzdGluJTNDL29wdGlvbiUzRSUyMCUzQy9zZWxlY3QlM0UlMjAlM0MvcCUzRSUyMCUzQy9maWVsZHNldCUzRSUyMCUzQ2hyJTNFJTIwJTNDcCUyMGNsYXNzPSUyMnRleHQtcmlnaHQlMjIlM0UlMjAlM0NzbWFsbCUyMGRhdGEtaWQ9JTIyZXJyb3ItZmVlZGJhY2slMjIlMjBjbGFzcz0lMjJtYXJnaW4tcmlnaHQlMjIlM0UlM0Mvc21hbGwlM0UlMjAlM0NidXR0b24lM0VTZSUyMGNvbm5lY3RlciUzQy9idXR0b24lM0UlMjAlM0MvcCUzRSUyMCUzQy9mb3JtJTNFJTIwJTNDL2FwcC1hdXRoZW50aWNhdGlvbi1mb3JtJTNFJTIw");
templateRepository.set("calendar-grid_main", "JTNDbmF2JTNFJTIwJTNDbWVudSUzRSUyMCU3QiMlMjBzZWFyY2hOYXZpZ2F0aW9uJTdEJTIwJTNDbGklM0UlM0NhJTIwJTdCIyU3RCU3QiUyNSUyMGNsaWNrJTdEJTdCLyU3RCUzRSYjMTI4MjcwOyUzQy9hJTNFJTNDL2xpJTNFJTIwJTdCLyU3RCUyMCU3QiMlMjB1bnJlYWROYXZpZ2F0aW9uJTdEJTIwJTNDbGklM0UlM0NhJTIwJTdCIyU3RCU3QiUyNSUyMGNsaWNrJTdEJTdCLyU3RCUzRSYjMTI4Mjc2OyUyMCglM0NzcGFuJTIwJTdCIyU3RCU3QiQlMjBzaXplJTdEJTdCLyU3RCUzRSUzQy9zcGFuJTNFKSUzQy9hJTNFJTNDL2xpJTNFJTIwJTdCLyU3RCUyMCUzQy9tZW51JTNFJTIwJTNDL25hdiUzRSUyMCUzQ2Zvcm0lM0UlMjAlM0NmaWVsZHNldCUzRSUyMCUzQ2xhYmVsJTIwZm9yPSUyMmNhbGVuZGFyLWdyaWRfbWFpbl9fZGF0ZV9zZWxlY3QlMjIlMjAlM0VEYXRlJTIwZCdpbnQlQzMlQTlyJUMzJUFBdCUzQy9sYWJlbCUzRSYjMTYwOzolMjAlM0NpbnB1dCUyMHR5cGU9JTIyZGF0ZSUyMiUyMGlkPSUyMmNhbGVuZGFyLWdyaWRfbWFpbl9fZGF0ZV9zZWxlY3QlMjIlMjAlN0IjJTdEJTIwJTdCIyUyMGZpcnN0RGF0ZUluY2x1ZGVzQ29udHJvbGxlciU3RCUyMCU3QiUyNSUyMGNoYW5nZSU3RCUyMCU3QiUyMHZhbHVlJTIwJTdDJTIwdmFsdWUlMjAlN0QlMjAlN0IvJTdEJTIwJTdCLyU3RCUyMCUzRSUyMCUzQ2lucHV0JTIwdHlwZT0lMjJidXR0b24lMjIlMjB2YWx1ZT0lMjJQciVDMyVBOWMuJTIyJTIwJTdCIyU3RCUyMCU3QiMlMjBwcmV2aW91c1dlZWtDb250cm9sbGVyJTdEJTIwJTdCJTI1JTIwY2xpY2slN0QlMjAlN0IvJTdEJTIwJTdCLyU3RCUyMCUzRSUyMCUzQ2lucHV0JTIwdHlwZT0lMjJidXR0b24lMjIlMjB2YWx1ZT0lMjJTdWl2LiUyMiUyMCU3QiMlN0QlMjAlN0IjJTIwbmV4dFdlZWtDb250cm9sbGVyJTdEJTIwJTdCJTI1JTIwY2xpY2slN0QlMjAlN0IvJTdEJTIwJTdCLyU3RCUyMCUzRSUyMCUzQy9maWVsZHNldCUzRSUyMCUzQ2RpdiUyMGRhdGEtaWQ9JTIyY2FsZW5kYXItZ3JpZF9yb3dzJTIyJTNFJTNDL2RpdiUzRSUyMCUzQ2RpdiUyMGRhdGEtaWQ9JTIyY2FsZW5kYXItd2Vla2x5LWRldGFpbCUyMiUzRSUzQy9kaXYlM0UlMjAlM0NmaWVsZHNldCUzRSUyMCUzQ2lucHV0JTIwdHlwZT0lMjJyYW5nZSUyMiUyMG1pbj0lMjIzJTIyJTIwbWF4PSUyMjYlMjIlMjBsaXN0PSUyMmNhbGVuZGFyLXJpZF9tYWluX19yYW5nZV9zdWdnZXN0aW9ucyUyMiUyMCU3QiMlN0QlMjAlN0IjJTIwbnVtYmVyT2ZXZWVrc0NvbnRyb2xsZXIlN0QlMjAlN0IlMjUlMjBjaGFuZ2UlN0QlMjAlN0IlMjB2YWx1ZSUyMCU3QyUyMHZhbHVlJTIwJTdEJTIwJTdCLyU3RCUyMCU3Qi8lN0QlMjAlM0UlMjAlM0NkYXRhbGlzdCUyMGlkPSUyMmNhbGVuZGFyLXJpZF9tYWluX19yYW5nZV9zdWdnZXN0aW9ucyUyMiUzRSUyMCUzQ29wdGlvbiUyMHZhbHVlPSUyMjMlMjIlM0VWdWUlMjBwYXIlMjBzZW1haW5lJTNDL29wdGlvbiUzRSUyMCUzQ29wdGlvbiUyMHZhbHVlPSUyMjYlMjIlM0VWdWUlMjBtZW5zdWVsbGUlMjAlQzMlQTlsYXJnaWUlM0Mvb3B0aW9uJTNFJTIwJTNDL2RhdGFsaXN0JTNFJTIwJTNDL2ZpZWxkc2V0JTNFJTIwJTNDL2Zvcm0lM0U=");
templateRepository.set("calendar-grid_rows", "JTNDdGFibGUlM0UlMjAlM0N0aGVhZCUzRSUyMCUzQ3RyJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFTHVuLiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFTWFyLiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFTWVyLiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFSmV1LiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFVmVuLiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFU2FtLiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDdGglM0UlM0NhYmJyJTNFRGltLiUzQy9hYmJyJTNFJTNDL3RoJTNFJTIwJTNDL3RyJTNFJTIwJTNDL3RoZWFkJTNFJTIwJTdCIyUyMGJsb2NrcyU3RCUyMCUzQ3Rib2R5JTNFJTIwJTNDdHIlMjBjbGFzcz0lMjJiYXIlMjIlM0UlMjAlM0N0aCUyMGNvbHNwYW49JTIyNyUyMiUyMCUzRSUzQ2FwcC1mcmVuY2gtbW9udGglMjAlN0IjJTdEJTdCc3RyRGF0ZSUyMCU3QyUyMHN0ckRhdGUlN0QlN0IvJTdEJTNFJTNDL2FwcC1mcmVuY2gtbW9udGglM0UlMjAlM0MvdGglM0UlMjAlM0MvdHIlM0UlMjAlN0IjJTIwcm93cyU3RCUyMCUzQ3RyJTNFJTIwJTdCIyUyMGNvbHMlN0QlMjAlM0N0ZCUyMCU3QiMlN0QlMjAlN0IlMjUlMjBjbGljayU3RCUyMCU3Qj8lMjBoYXNBcHBvaW50bWVudHMlN0QlMjAlN0IlMjAlMjJoYXNBcHBvaW50bWVudHMlMjAlN0MlMjBjbGFzcyUyMCU3RCU3Qi8lN0QlMjAlN0I/JTIwaGFzTm9VbnJlYWQlN0QlMjAlN0IlMjAlMjJoYXNOb1VucmVhZCUyMCU3QyUyMGNsYXNzJTIwJTdEJTdCLyU3RCUyMCU3Qj8lMjBpc1RvZGF5JTdEJTIwJTdCJTIwJTIyaXNUb2RheSUyMCU3QyUyMGNsYXNzJTIwJTdEJTdCLyU3RCUyMCU3Qj8lMjBpc0ZvY3VzJTdEJTIwJTdCJTIwJTIyaXNGb2N1cyUyMCU3QyUyMGNsYXNzJTIwJTdEJTdCLyU3RCUyMCU3Qi8lN0QlMjAlM0UlN0I6JTIwaXNEYXlPZmYlN0QlM0NhcHAtZGF5LXR3by1kaWdpdHMlMjAlN0IjJTdEJTdCc3RyRGF0ZSU3Q3N0ckRhdGUlN0QlN0IvJTdEJTNFJTNDL2FwcC1kYXktdHdvLWRpZ2l0cyUyMCUzRSU3Qi8lN0QlN0I/JTIwaXNEYXlPZmYlN0QmIzk5Njk7JTdCLyU3RCUzQ3NwYW4lMjBjbGFzcz0lMjJoaWRlLXdoZW4taGFzTm9VbnJlYWQlMjIlM0UqJTNDL3NwYW4lM0UlM0MvdGQlM0UlMjAlN0IvJTdEJTIwJTNDL3RyJTNFJTIwJTdCLyU3RCUyMCUzQy90Ym9keSUzRSUyMCU3Qi8lN0QlMjAlM0MvdGFibGUlM0U=");
templateRepository.set("calendar-mutation-form", "JTNDaDElMjAlN0IjJTdEJTIwJTdCJCUyMHBhZ2VUaXRsZSU3RCUyMCU3Qi8lN0QlMjAlM0UlM0MvaDElM0UlMjAlM0NhcHAtY2FsZW5kYXItbXV0YXRpb24tZm9ybSUyMCU3QiMlN0QlMjAlN0IlMjBwcmVmZXJyZWQtZGF0ZSUyMCU3QyUyMHByZWZlcnJlZC1kYXRlJTIwJTdEJTIwJTdCJTIwcHJlZmVycmVkLXRpbWUlMjAlN0MlMjBwcmVmZXJyZWQtdGltZSUyMCU3RCUyMCU3QiUyMHByZWZlcnJlZC1kZXNjcmlwdGlvbiUyMCU3QyUyMHByZWZlcnJlZC1kZXNjcmlwdGlvbiUyMCU3RCUyMCU3QiUyMHByZWZlcnJlZC1kZXRhaWxzJTIwJTdDJTIwcHJlZmVycmVkLWRldGFpbHMlMjAlN0QlMjAlN0IlMjBwcmVmZXJyZWQtaXMtZGF5LW9mZiUyMCU3QyUyMHByZWZlcnJlZC1pcy1kYXktb2ZmJTIwJTdEJTIwJTdCJTI1JTIwYXBwLWNhbGVuZGFyLW11dGF0aW9uLWZvcm0tY2hhbmdlJTdEJTIwJTdCJTI1JTIwYXBwLWNhbGVuZGFyLW11dGF0aW9uLWZvcm0tc3VibWl0JTdEJTIwJTdCLyU3RCUyMCUzRSUyMCUzQ2Zvcm0lM0UlMjAlM0NmaWVsZHNldCUyMGNsYXNzPSUyMm11bHRpLWNvbHVtbi0yJTIyJTNFJTIwJTNDZGl2JTIwY2xhc3M9JTIyY29sdW1uJTIyJTNFJTIwJTNDcCUyMGNsYXNzPSUyMnRleHQtY2VudGVyZWQlMjIlM0UlMjAlM0NsYWJlbCUzRUpvdXIlMjBkdSUyMHJlbmRlei12b3VzJTNDL2xhYmVsJTNFOiYjMTYwOyUzQ2JyJTIwJTNFJTNDaW5wdXQlMjB0eXBlPSUyMmRhdGUlMjIlMjBuYW1lPSUyMmRhdGVDb250cm9sbGVyJTIyJTIwcmVxdWlyZWQlM0UlMjAlM0MvcCUzRSUyMCUzQ3AlMjBjbGFzcz0lMjJ0ZXh0LWNlbnRlcmVkJTIyJTNFJTIwJTNDaW5wdXQlMjB0eXBlPSUyMmNoZWNrYm94JTIyJTIwbmFtZT0lMjJpc0RheU9mZkNvbnRyb2xsZXIlMjIlMjAlM0UlM0NsYWJlbCUzRUpvdXIlMjBmJUMzJUE5cmklQzMlQTkmIzE2MDs/JiMxNjA7JiM5OTY5OyUzQy9sYWJlbCUzRSUyMCUzQy9wJTNFJTIwJTNDL2RpdiUzRSUyMCUzQ2RpdiUyMGNsYXNzPSUyMmNvbHVtbiUyMiUzRSUyMCUzQ3AlMjBjbGFzcz0lMjJ0ZXh0LWNlbnRlcmVkJTIyJTNFJTIwJTNDbGFiZWwlM0VQbGFnZSUyMGhvcmFpcmUlM0MvbGFiZWwlM0U6JiMxNjA7JTNDYnIlMjAlM0UlM0NzZWxlY3QlMjBuYW1lPSUyMnRpbWVSYW5nZUNvbnRyb2xsZXIlMjIlM0UlMjAlM0NvcHRpb24lMjB2YWx1ZT0lMjIlMjIlM0VQb25jdHVlbCUzQy9vcHRpb24lM0UlMjAlM0NvcHRpb24lMjB2YWx1ZT0lMjJmdWxsZGF5JTIyJTNFVG91dGUlMjBsYSUyMGpvdXJuJUMzJUE5ZSUzQy9vcHRpb24lM0UlMjAlM0NvcHRpb24lMjB2YWx1ZT0lMjJtb3JuaW5nJTIyJTNFTGElMjBtYXRpbiVDMyVBOWUlM0Mvb3B0aW9uJTNFJTIwJTNDb3B0aW9uJTIwdmFsdWU9JTIyYWZ0ZXJub29uJTIyJTNFTCdhcHIlQzMlQThzLW1pZGklM0Mvb3B0aW9uJTNFJTIwJTNDL3NlbGVjdCUzRSUyMCUzQy9wJTNFJTIwJTNDcCUyMGNsYXNzPSUyMnRleHQtY2VudGVyZWQlMjIlM0UlMjAlM0NsYWJlbCUzRUhldXJlJTIwZHUlMjByZW5kZXotdm91cyUzQy9sYWJlbCUzRTomIzE2MDslM0NiciUyMCUzRSUzQ2lucHV0JTIwdHlwZT0lMjJ0aW1lJTIyJTIwbmFtZT0lMjJ0aW1lTnVtZXJpY0NvbnRyb2xsZXIlMjIlM0UlMjAlM0MvcCUzRSUyMCUzQy9kaXYlM0UlMjAlM0MvZmllbGRzZXQlM0UlMjAlM0Nhc2lkZSUyMGRhdGEtaWQ9JTIyY29uZmxpY3RzX2NvbnRhaW5lciUyMiUyMGNsYXNzPSUyMmVycm9yLWJveCUyMGhpZGRlbiUyMiUzRSUyMCUzQ3AlM0UmIzk5NDA7JTIwTGVzJTIwcmVuZGV6LXZvdXMlMjBzdWl2YW50cyUyMHNvbnQlMjBlbiUyMGNvbmZsaXQ6JTNDL3AlM0UlMjAlM0NkaXYlMjBkYXRhLWlkPSUyMmFwcG9pbnRtZW50c19saXN0JTIyJTNFJTNDL2RpdiUzRSUyMCUzQy9hc2lkZSUzRSUyMCUzQ2ZpZWxkc2V0JTNFJTIwJTNDcCUyMGNsYXNzPSUyMnRleHQtY2VudGVyZWQlMjIlM0UlMjAlM0NsYWJlbCUzRURlc2NyaXB0aW9uJTIwZHUlMjByZW5kZXotdm91cy4lM0MvbGFiZWwlM0UlM0NiciUzRSUyMCUzQ3NtYWxsJTNFVW4lMjB0ZXh0ZSUyMHN1Y2NpbmN0JTIwcGVybWV0JTIwZCdhbSVDMyVBOWxpb3JlciUyMGxhJTIwcmVjaGVyY2hlJTIwcGFyJTIwbW90cy1jbCVDMyVBOS4lM0Mvc21hbGwlM0UlMjAlM0NiciUzRSUyMCUzQ3RleHRhcmVhJTIwbmFtZT0lMjJkZXNjcmlwdGlvbkNvbnRyb2xsZXIlMjIlMjBjb2xzPSUyMjQwJTIyJTIwcm93cz0lMjI0JTIyJTIwcmVxdWlyZWQlM0UlM0MvdGV4dGFyZWElM0UlMjAlM0MvcCUzRSUyMCUzQ3AlMjBjbGFzcz0lMjJ0ZXh0LWNlbnRlcmVkJTIyJTNFJTIwJTNDbGFiZWwlM0VDb21tZW50YWlyZXMlM0MvbGFiZWwlM0UlM0NiciUzRSUyMCUzQ3NtYWxsJTNFKGxpZXUsJTIwcGFwaWVycyUyMCVDMyVBMCUyMGFwcG9ydGVyLCUyMCZoZWxsaXA7KS4lM0Mvc21hbGwlM0UlMjAlM0NiciUzRSUyMCUzQ3RleHRhcmVhJTIwbmFtZT0lMjJkZXRhaWxzQ29udHJvbGxlciUyMiUyMGNvbHM9JTIyNDAlMjIlMjByb3dzPSUyMjQlMjIlM0UlM0MvdGV4dGFyZWElM0UlMjAlM0MvcCUzRSUyMCUzQy9maWVsZHNldCUzRSUyMCUzQ2hyJTNFJTIwJTNDZGl2JTIwY2xhc3M9JTIybXVsdGktY29sdW1uLTIlMjIlM0UlMjAlM0NwJTIwY2xhc3M9JTIyY29sdW1uJTIyJTNFJTIwJTdCPyUyMGFsbG93Q2FuY2VsJTdEJTIwJTNDbGFiZWwlM0UlM0NpbnB1dCUyMHR5cGU9JTIyY2hlY2tib3glMjIlMjBuYW1lPSUyMmNhbmNlbENvbnRyb2xsZXIlMjIlM0VBbm51bGVyJTIwbGUlMjByZW5kZXotdm91cyUzQy9sYWJlbCUzRSUyMCU3Qi8lN0QlMjAlM0MvcCUzRSUyMCUzQ3AlMjBjbGFzcz0lMjJjb2x1bW4lMjB0ZXh0LXJpZ2h0JTIyJTNFJTIwJTNDYnV0dG9uJTIwJTdCIyU3RCUyMCU3QiQlMjBzdWJtaXRUZXh0JTdEJTIwJTdCLyU3RCUzRSUzQy9idXR0b24lM0UlMjAlM0MvcCUzRSUyMCUzQy9kaXYlM0UlMjAlM0MvZm9ybSUzRSUyMCUzQy9hcHAtY2FsZW5kYXItbXV0YXRpb24tZm9ybSUzRQ==");
templateRepository.set("calendar-mutation-form_conflicts", "JTNDcCUzRUxlcyUyMHJlbmRlei12b3VzJTIwc3VpdmFudHMlMjBzb250JTIwZW4lMjBjb25mbGl0JTIwaG9yYWlyZTolM0MvcCUzRSUyMCUzQ2RsJTNFJTIwJTdCIyUyMGFwcG9pbnRtZW50cyU3RCUyMCUzQ2R0JTIwJTNFJTNDYXBwLWxvbmctZnJlbmNoLXRpbWUlMjAlN0IjJTdEJTIwJTdCJTIwc3RyVGltZSUyMCU3QyUyMHN0clRpbWUlMjAlN0QlMjAlN0IvJTdEJTIwJTNFJTNDL2FwcC1sb25nLWZyZW5jaC10aW1lJTIwJTNFJTNDL2R0JTNFJTIwJTNDZGQlMjAlN0IjJTdEJTIwJTdCJCUyMHN0ckRlc2NyaXB0aW9uJTdEJTIwJTdCLyU3RCUyMCUzRSUzQy9kZCUzRSUyMCU3Qi8lN0QlMjAlM0MvZGwlM0UlMjA=");
templateRepository.set("day-appointments_main", "JTNDbmF2JTNFJTIwJTNDbWVudSUzRSUyMCU3QiMlMjBtZW51JTdEJTIwJTdCIyUyMGJhY2slN0QlMjAlM0NsaSUzRSUzQ2ElMjAlN0IjJTdEJTIwJTdCJTI1JTIwY2xpY2slN0QlMjAlN0IvJTdEJTIwJTNFJiMxMjgxOTc7JTNDL2ElM0UlM0MvbGklM0UlMjAlN0IvJTdEJTIwJTdCIyUyMGNyZWF0ZSU3RCUyMCUzQ2xpJTNFJTNDYSUyMCU3QiMlN0QlMjAlN0IlMjUlMjBjbGljayU3RCUyMCU3Qi8lN0QlMjAlM0UmIzEwMTMzOyUzQy9hJTNFJTNDL2xpJTNFJTIwJTdCLyU3RCUyMCU3Qi8lN0QlMjAlM0MvbWVudSUzRSUyMCUzQy9uYXYlM0UlMjAlM0NoMSUzRVJlbmRlei12b3VzJTIwZHUlMjAlM0NhcHAtbG9uZy1mcmVuY2gtZGF0ZSUyMCU3QiMlN0QlN0IlMjBzdHJEYXRlJTIwJTdDJTIwc3RyRGF0ZSUyMCU3RCU3Qi8lN0QlMjAlM0UlM0MvYXBwLWxvbmctZnJlbmNoLWRhdGUlM0UlMjAlM0MvaDElM0UlMjAlN0I/JTIwaGFzQXBwb2ludG1lbnRzJTdEJTIwJTNDZGl2JTIwZGF0YS1pZD0lMjJhcHBvaW50bWVudHNfbGlzdCUyMiUzRSUzQy9kaXYlM0UlMjAlN0IvJTdEJTIwJTdCOiUyMGhhc0FwcG9pbnRtZW50cyU3RCUyMCUzQ3AlM0VBdWN1biUyMHJlbmRlei12b3VzJTIwcHIlQzMlQTl2dSUyMCVDMyVBMCUyMGNldHRlJTIwZGF0ZS4lM0MvcCUzRSUyMCU3Qi8lN0Q=");
templateRepository.set("unread-appointments_main", "JTNDbmF2JTNFJTIwJTNDbWVudSUzRSUyMCU3QiMlMjBtZW51JTdEJTIwJTdCIyUyMGJhY2slN0QlMjAlM0NsaSUzRSUzQ2ElMjAlN0IjJTdEJTIwJTdCJTI1JTIwY2xpY2slN0QlMjAlN0IvJTdEJTIwJTNFJiMxMjgxOTc7JTNDL2ElM0UlM0MvbGklM0UlMjAlN0IvJTdEJTIwJTdCIyUyMG1hcmtSZWFkJTdEJTIwJTNDbGklM0UlM0NhJTIwJTdCIyU3RCUyMCU3QiUyNSUyMGNsaWNrJTdEJTIwJTdCLyU3RCUyMCUzRSYjOTk4OTslM0MvYSUzRSUzQy9saSUzRSUyMCU3Qi8lN0QlMjAlN0IjJTIwY3JlYXRlJTdEJTIwJTNDbGklM0UlM0NhJTIwJTdCIyU3RCUyMCU3QiUyNSUyMGNsaWNrJTdEJTIwJTdCLyU3RCUyMCUzRSYjMTAxMzM7JTNDL2ElM0UlM0MvbGklM0UlMjAlN0IvJTdEJTIwJTdCLyU3RCUyMCUzQy9tZW51JTNFJTIwJTNDL25hdiUzRSUyMCUzQ2gxJTNFUmVuZGV6LXZvdXMlMjBub24lMjBsdXMlM0MvaDElM0UlMjAlN0I/JTIwaGFzQXBwb2ludG1lbnRzJTdEJTIwJTNDZGl2JTIwZGF0YS1pZD0lMjJhcHBvaW50bWVudHNfbGlzdCUyMiUzRSUzQy9kaXYlM0UlMjAlN0IvJTdEJTIwJTdCOiUyMGhhc0FwcG9pbnRtZW50cyU3RCUyMCUzQ3AlM0VBdWN1biUyMHJlbmRlei12b3VzJTIwbm9uJTIwbHVzLiUzQy9wJTNFJTIwJTdCLyU3RA==");

        function getTemplate(templateId) {
            const templateContent = templateRepository.get(templateId);
            if(!templateContent) throw "Unknown template for id " + templateId;
            const text = decodeURI(atob(templateContent));
            return text;
        }
        window['getAppTemplate'] = getTemplate;
        