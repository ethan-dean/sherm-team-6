import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Collapse,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "sonner";
import type { DesignProblem } from "../../services/design.service";

interface Props {
  problems: DesignProblem[];
  total: number;
  sortBy: "asc" | "desc";
  setSortBy: (s: "asc" | "desc") => void;
  onSendProblem: (problemId: string, email: string) => Promise<void> | void;
  sendingId: string | null;
}

export default function Problems({
  problems,
  total,
  sortBy,
  setSortBy,
  onSendProblem,
  sendingId,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        background: "rgba(20,20,25,0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(98,0,69,0.3)",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(98,0,69,0.2)",
        width: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          width: "100%",
          minWidth: 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "white", fontWeight: 600, letterSpacing: 0.5 }}
        >
          Problems
          <Typography
            component="span"
            sx={{ ml: 2, color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}
          >
            {total} total
          </Typography>
        </Typography>

        {/* Styled Sort dropdown (MUI Select) */}
        <FormControl
          size="small"
          sx={{
            minWidth: 220,
            ".MuiInputLabel-root": {
              color: "rgba(255,255,255,0.75)",
              "&.Mui-focused": {
                color: "rgba(255,255,255,0.9)", // <-- keeps label white when focused
              },
            },
            ".MuiOutlinedInput-root": {
              background: "rgba(0,0,0,0.35)",
              borderRadius: 2,
              "&:hover fieldset": { borderColor: "rgba(98,0,69,0.8)" },
              "&.Mui-focused fieldset": { borderColor: "rgba(98,0,69,1)" },
            },
          }}
        >
          <InputLabel sx={{ color: "rgba(255,255,255,0.75)" }}>
            Difficulty
          </InputLabel>
          <Select
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value as "asc" | "desc")}
            sx={{
              color: "white",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(98,0,69,0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(98,0,69,0.8)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(98,0,69,1)",
              },
              ".MuiSvgIcon-root": { color: "white" },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  background: "rgba(20,20,25,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(98,0,69,0.35)",
                  color: "white", // <-- makes text inside dropdown white
                  "& .MuiMenuItem-root": {
                    color: "white", // ensures all items stay white
                    "&.Mui-selected": { background: "rgba(98,0,69,0.4)" },
                    "&:hover": { background: "rgba(98,0,69,0.3)" },
                  },
                },
              },
            }}
          >
            <MenuItem value="asc">Low to High</MenuItem>
            <MenuItem value="desc">High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Problems list (full width) */}
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
      >
        {problems.map((p) => (
          <ProblemCard
            key={p.id}
            problem={p}
            expanded={expandedId === p.id}
            onToggle={() => handleToggleExpand(p.id)}
            onSend={(email) => onSendProblem(p.id, email)}
            sending={sendingId === p.id}
          />
        ))}

        {!problems.length && (
          <Box
            sx={{
              py: 8,
              display: "grid",
              placeItems: "center",
              color: "rgba(255,255,255,0.6)",
              border: "1px dashed rgba(255,255,255,0.2)",
              borderRadius: 2,
            }}
          >
            No problems available.
          </Box>
        )}
      </Box>
    </Paper>
  );
}

function ProblemCard({
  problem,
  expanded,
  onToggle,
  onSend,
  sending,
}: {
  problem: DesignProblem;
  expanded: boolean;
  onToggle: () => void;
  onSend: (email: string) => Promise<void> | void;
  sending: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  const openDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEmail("");
  };

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error("Please enter an applicant email");
      return;
    }
    await onSend(email.trim());
    closeDialog();
  };

  // Explicit arrow click handler so it toggles reliably
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,0,15,0.6) 100%)",
        border: "1px solid rgba(98,0,69,0.35)",
        borderRadius: 2,
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: "rgba(98,0,69,0.7)",
          transform: "translateY(-2px)",
        },
        cursor: "pointer",
      }}
      onClick={onToggle}
    >
      {/* Header row (collapsed: no description) */}
      <CardContent sx={{ pb: 1.5, pt: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 700,
              flex: 1,
              lineHeight: 1.3,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {problem.name}
          </Typography>

          <Chip
            label={`Level ${Number(problem.difficulty).toFixed(0)}`}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: "rgba(98,0,69,0.9)",
              color: "white",
              border: "1px solid rgba(98,0,69,1)",
            }}
          />

          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton
              aria-label="Send assessment"
              onClick={(e) => {
                e.stopPropagation();
                openDialog(e);
              }}
              disabled={sending}
              sx={{
                color: "white",
                bgcolor: "rgba(98,0,69,0.5)",
                border: "1px solid rgba(98,0,69,0.7)",
                "&:hover": { bgcolor: "rgba(98,0,69,0.8)" },
              }}
              size="small"
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>

            {/* Expand arrow explicitly toggles */}
            <IconButton
              aria-label="Expand"
              onClick={handleExpandClick}
              sx={{
                color: "rgba(255,255,255,0.85)",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>

      {/* Expandable details */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ opacity: 0.2 }} />
        <CardContent sx={{ pt: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "rgba(255,255,255,0.9)", mb: 1, fontWeight: 700 }}
          >
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.86)", whiteSpace: "pre-line" }}
          >
            {problem.description || "No description provided."}
          </Typography>
        </CardContent>

        <CardActions
          sx={{ px: 3, pb: 2.5, pt: 0, justifyContent: "flex-end" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="contained"
            size="medium"
            startIcon={<ArrowForwardIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
            disabled={sending}
            sx={{
              bgcolor: "rgba(98,0,69,0.95)",
              textTransform: "none",
              borderRadius: 1.5,
              fontWeight: 700,
              px: 2.5,
              "&:hover": { bgcolor: "rgba(98,0,69,1)" },
            }}
          >
            {sending ? "Sending…" : "Send assessment"}
          </Button>
        </CardActions>
      </Collapse>

      {/* Send dialog (styled like the cards) */}
      <Dialog
        open={dialogOpen}
        // Block closing while sending so UI doesn't jitter
        onClose={(_, reason) => {
          if (
            sending &&
            (reason === "backdropClick" || reason === "escapeKeyDown")
          )
            return;
          closeDialog();
        }}
        disableEscapeKeyDown={sending}
        keepMounted
        onClick={(e) => e.stopPropagation()}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "rgba(20,20,25,0.95)",
            backdropFilter: "blur(25px)",
            border: "1px solid rgba(98,0,69,0.4)",
            boxShadow: "0 8px 32px rgba(98,0,69,0.45)",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            fontWeight: 700,
            pb: 1.5,
          }}
        >
          Send assessment
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            borderColor: "rgba(98,0,69,0.25)",
            color: "rgba(255,255,255,0.9)",
            pt: 2,
          }}
        >
          <TextField
            autoFocus
            margin="dense"
            label="Applicant email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // 👇 keep the field enabled; just block edits while sending
            inputProps={{ readOnly: sending }}
            // Optional: show busy state for screen readers
            slotProps={{ input: { "aria-busy": sending } as any }}
            sx={{
              mt: 1,
              // Label colors
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.75)",
                "&.Mui-focused": { color: "rgba(255,180,220,0.95)" },
                "&.Mui-error": { color: "#ff7373" },
              },

              // Outlined root
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 1.5,
                transition: "border-color .2s, box-shadow .2s, background-color .2s",

                // Border / outline
                "& fieldset": { borderColor: "rgba(255,255,255,0.18)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255,180,220,0.95)",
                  boxShadow: "0 0 0 3px rgba(255,180,220,0.25)",
                },

                // Input text + placeholder
                "& input": {
                  fontWeight: 600,
                  "::placeholder": { color: "rgba(255,255,255,0.55)", opacity: 1 },
                },

                // Readonly (when sending)
                "&.MuiInputBase-readOnly": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.18)" },
                  cursor: "default",
                },
              },

              // Kill Chrome autofill yellow on dark background
              "& input:-webkit-autofill": {
                WebkitTextFillColor: "#fff",
                transition: "background-color 9999s ease-out",
                WebkitBoxShadow: "0 0 0px 1000px rgba(255,255,255,0.06) inset",
                boxShadow: "0 0 0px 1000px rgba(255,255,255,0.06) inset",
              },
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid rgba(98,0,69,0.25)",
            gap: 1,
          }}
        >
          <Button
            onClick={closeDialog}
            variant="text"
            disabled={sending}
            sx={{ color: "rgba(255,255,255,0.85)" }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSend}
            variant="contained"
            disabled={sending}
            startIcon={!sending ? <ArrowForwardIcon /> : undefined}
            endIcon={
              sending ? <CircularProgress size={16} sx={{ color: "white" }} /> : undefined
            }
            sx={{
              bgcolor: sending ? "rgba(98,0,69,0.65)" : "rgba(98,0,69,0.95)",
              textTransform: "none",
              borderRadius: 1.5,
              fontWeight: 700,
              px: 2.5,
              minWidth: 180,
              color: "white",
              "&.Mui-disabled": {
                color: "white",
                opacity: 1, // prevent dark fade
                bgcolor: "rgba(98,0,69,0.4)", // subtle contrast instead of blackout
              },
              "&:hover": { bgcolor: "rgba(98,0,69,1)" },
            }}
          >
            {sending ? "Sending" : "Send assessment"}
          </Button>

        </DialogActions>
      </Dialog>
    </Card>
  );
}
